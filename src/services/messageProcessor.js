// ============================================
// SYSTEM PROMPT - CEREBRO ENTERPRISE
// ============================================
const SYSTEM_PROMPT_TEXT = `
INSTRUCCIONES MAESTRAS:
Eres **Miguel**, Coordinador Senior de Experiencia al Cliente en **OMMEO** (Colombia).
Tu misión es **agendar servicios** de forma cálida y eficiente.

TUS SERVICIOS:
1. 🏠 Limpieza (profunda, regular, post-obra)
2. 🐶 Mascotas (paseo, guardería, baño)
3. 💅 Uñas (manicure, pedicure, acrílicas)
4. 💈 Barbería (corte, barba, afeitado)

PERSONALIDAD OBLIGATORIA:
- Tono: Profesional, "paisa" suave, muy amable.
- Emoji: Usa 🧡 una vez por respuesta.
- Longitud: MÁXIMO 2-3 frases. Al grano.

REGLAS DE NEGOCIO:
- Flow: Servicio -> Fecha/Hora -> Zona -> Confirmación.
- Precios: "El valor depende del servicio exacto 🧡 Cuéntame qué necesitas y te cotizo."
- Pagos: Al final del servicio.
- Seguridad: Profesionales verificados, con antecedentes.

EJEMPLO DE RESPUESTA IDEAL:
Usuario: "Quiero aseo"
Miguel: "¡Claro que sí! 🧡 ¿Para qué día necesitas el servicio de limpieza y en qué barrio estás?"
`;

const { model, fallbackModel } = require('../config/geminiClient');
const { supabase } = require('../config/supabaseClient');
const axios = require('axios');
const { searchKnowledge } = require('./ragService');
const { extractBookingData, isBookingComplete, createBooking, getBookingPrompt } = require('./bookingService');
const { shouldHandoff, createHandoff, getHandoffMessage } = require('./handoffService');
const { EVENTS, SCORE_DELTAS, trackEvent, updateLeadScore } = require('./analyticsService');

// In-memory fallback
const memoryStore = new Map();
const SESSION_TTL = 30 * 60 * 1000;

async function processIncomingMessage(payload) {
  const { from, messageBody, phoneNumberId } = payload;
  const startTime = Date.now();
  
  console.log(`[Brain] 📥 Procesando: "${messageBody}"`);

  // Analytics (Fire & Forget)
  trackEvent(EVENTS.MESSAGE_RECEIVED, from, { message: messageBody }).catch(() => {});

  if (!model) {
    console.error('[Brain] ❌ Models not initialized');
    await sendFallbackMessage(phoneNumberId, from);
    return;
  }

  try {
    // 1. Obtener contexto (Supabase o Memoria)
    let { history, metadata } = await getConversation(from);
    
    // 2. Booking Intelligence Upgrade
    const prevBookingData = metadata.bookingData || {};
    const extractedData = extractBookingData(messageBody, prevBookingData);
    const bookingData = { ...prevBookingData, ...extractedData };
    
    // Save booking progress if updated
    if (JSON.stringify(bookingData) !== JSON.stringify(prevBookingData)) {
       metadata.bookingData = bookingData;
       trackEvent(EVENTS.BOOKING_STARTED, from, bookingData).catch(() => {});
    }

    // 3. Human Handoff Check
    const handoffCheck = shouldHandoff(messageBody, {
      confusionCount: metadata.confusionCount || 0,
      bookingComplete: isBookingComplete(bookingData)
    });

    if (handoffCheck.trigger) {
      console.log(`[Brain] 🔄 Handoff activado: ${handoffCheck.reason}`);
      await createHandoff(from, handoffCheck.reason, summarizeHistory(history), handoffCheck.priority);
      await sendWhatsAppMessage(phoneNumberId, from, getHandoffMessage(handoffCheck.reason));
      return;
    }

    // 4. Auto-Booking Creation
    if (isBookingComplete(bookingData) && !metadata.bookingCreated) {
      const booking = await createBooking(from, bookingData);
      if (booking) {
        metadata.bookingCreated = true;
        console.log(`[Brain] 📅 Booking guardado en DB: ${booking.id}`);
        trackEvent(EVENTS.BOOKING_CREATED, from, booking).catch(() => {});
      }
    }

    // 5. RAG Retrieval (Knowledge Base)
    let ragContext = '';
    try {
      ragContext = await searchKnowledge(messageBody);
      if(ragContext) console.log('[Brain] 🧠 RAG Context found');
    } catch (e) { 
      console.log('[Brain] RAG offline'); 
    }

    // 6. Construcción del Cerebro (Context Injection)
    // Inyectamos TODO el contexto en un solo turno para evitar corrupción de estado
    const fullContextPrompt = `
${SYSTEM_PROMPT_TEXT}

INFORMACIÓN CLAVE (RAG) DE OMMEO:
${ragContext || 'No hay info específica adicional.'}

ESTADO DEL AGENDAMIENTO:
${JSON.stringify(bookingData)}

${getBookingPrompt(bookingData)}

HISTORIAL DE CONVERSACIÓN:
${summarizeHistory(history)}

CLIENTE DICE: "${messageBody}"
RESPONDER COMO MIGUEL:
`;

    console.log('[Brain] 🤖 Pensando...');
    
    let responseText = '';
    
    // INTENTO 1: Modelo Principal (Flash-001)
    try {
      const result = await model.generateContent(fullContextPrompt);
      responseText = result.response.text();
    } catch (primaryError) {
      console.warn(`[Brain] ⚠️ Primary model failed (${primaryError.message}). Switch to Fallback.`);
      trackEvent(EVENTS.ERROR, from, { error: 'primary_model_failed', details: primaryError.message }).catch(() => {});
      
      // INTENTO 2: Modelo Fallback (Pro)
      if (fallbackModel) {
        try {
          const resultMixin = await fallbackModel.generateContent(fullContextPrompt);
          responseText = resultMixin.response.text();
          console.log('[Brain] ✅ Recovered with Fallback Model');
        } catch (secondaryError) {
          throw new Error(`All models failed: ${secondaryError.message}`);
        }
      } else {
        throw primaryError;
      }
    }

    console.log(`[Brain] ✅ Respuesta (${Date.now() - startTime}ms): "${responseText.substring(0, 50)}..."`);

    // 7. Guardar y Responder
    const newHistory = [...history, { role: 'user', parts: [{ text: messageBody }] }, { role: 'model', parts: [{ text: responseText }] }];
    await saveConversation(from, newHistory, { ...metadata, bookingData });
    await sendWhatsAppMessage(phoneNumberId, from, responseText);

  } catch (error) {
    console.error(`[Brain] ❌ CRITICAL FAILURE:`, error.message);
    await sendFallbackMessage(phoneNumberId, from);
  }
}

// ============================================
// HELPERS (Supabase + Persistence)
// ============================================
async function getConversation(phoneNumber) {
  if (supabase) {
    try {
      const { data } = await supabase.from('conversations').select('history, metadata').eq('phone_number', phoneNumber).single();
      if (data) return { history: data.history || [], metadata: data.metadata || {} };
    } catch (e) {}
  }
  const session = memoryStore.get(phoneNumber);
  return session || { history: [], metadata: {} };
}

async function saveConversation(phoneNumber, history, metadata) {
  memoryStore.set(phoneNumber, { history, metadata, lastUpdate: Date.now() });
  if (supabase) {
    try { await supabase.from('conversations').upsert({ phone_number: phoneNumber, history, metadata, updated_at: new Date().toISOString() }, { onConflict: 'phone_number' }); } catch (e) {}
  }
}

function summarizeHistory(history) {
  // Limitamos a los últimos 6 mensajes para no saturar el contexto
  return history.slice(-6).map(h => `${h.role}: ${h.parts[0]?.text}`).join('\n');
}

// ============================================
// WHATSAPP SENDER
// ============================================
async function sendWhatsAppMessage(phoneNumberId, to, text) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  try {
    await axios.post(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      messaging_product: 'whatsapp', to, type: 'text', text: { body: text }
    }, { headers: { 'Authorization': `Bearer ${token}` } });
    return true;
  } catch (e) { console.error('WA Send Error:', e.message); return false; }
}

async function sendFallbackMessage(phoneNumberId, to) {
  await sendWhatsAppMessage(phoneNumberId, to, "¡Hola! 🧡 Soy Miguel. ¿Qué servicio te interesa? (Limpieza 🏠, Mascotas 🐶, Uñas 💅, Barbería 💈)");
}

module.exports = { processIncomingMessage };
