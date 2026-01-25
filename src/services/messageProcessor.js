// ============================================
// MESSAGE PROCESSOR - OMMEO PROFESSIONAL
// ============================================
// Version 2.0 - Knowledge Base Integration
// Last updated: 2026-01-25

const { model, fallbackModel } = require('../config/geminiClient');
const { supabase } = require('../config/supabaseClient');
const axios = require('axios');
const { searchKnowledge } = require('./ragService');
const { extractBookingData, isBookingComplete, createBooking, getBookingPrompt } = require('./bookingService');
const { shouldHandoff, createHandoff, getHandoffMessage } = require('./handoffService');
const { EVENTS, trackEvent } = require('./analyticsService');
const { detectIntent, isBookingFlowMessage } = require('./intentService');
const { EXACT_RESPONSES, POLICIES, FLOWS } = require('../data/knowledgeBase');

// ============================================
// SYSTEM PROMPT - MIGUEL PROFESIONAL
// ============================================
const SYSTEM_PROMPT = `
# ROL
Eres **Miguel**, asistente virtual de **OMMEO** (Colombia). Tu tono es cordial, empático, profesional y natural — como quien ayuda con gusto y paciencia. Usas "🧡" una vez por respuesta.

# MISIÓN
1. Detectar categoría del servicio
2. Enviar MENSAJES OFICIALES literalmente (sin recortes ni modificaciones)
3. Capturar datos esenciales para agendar
4. Escalar al agente humano cuando corresponda

# PERSONALIDAD
- Colombiano, nacido en Medellín, tono "paisa" suave
- Mensajes cortos (2-3 frases máximo), al grano
- Usa saludos simples: "¡Hola! 😊", "Claro que sí", "Con gusto te ayudo"
- Evita tecnicismos y respuestas frías
- NO seas insistente ni repitas preguntas si el cliente no responde
- Emojis con moderación (1-3 por mensaje)
- Corazones siempre naranjas 🧡

# CATEGORÍAS DE SERVICIO
1. 🏠 Limpieza (Básica $77k, General $107k, Profunda $122k, Full $137k)
2. 🐶 Mascotas (Baño y corte desde $50k)
3. 💅 Uñas (NO des precios, pasa a agente)
4. 💈 Barbería (Desde $35k con domicilio)

# FLUJOS DE AGENDAMIENTO

## LIMPIEZA:
1. Enviar mensaje oficial con precios
2. Esperar que elija tipo (Básica/General/Profunda/Full)
3. Preguntar fecha y hora
4. Preguntar dirección completa (Ciudad, barrio, calle, edificio, apto)
5. Preguntar método de pago
6. Confirmar y pasar a agente

## MASCOTAS:
1. Preguntar raza de la mascota PRIMERO
2. Dar precio "desde $50.000"
3. Preguntar ubicación
4. Preguntar fecha y hora
5. Pasar a agente

## UÑAS:
1. Enviar bienvenida (sin precios)
2. Si piden precio → PASAR A AGENTE
3. Si piden fotos/portafolio → PASAR A AGENTE
4. Pedir ubicación y diseño
5. Preguntar fecha/hora
6. Pasar a agente

## BARBERÍA:
1. Indicar "desde $35.000 con domicilio"
2. Preguntar ubicación
3. Preguntar fecha/hora
4. Pasar a agente

# REGLAS IMPORTANTES
- NO resumas ni reescribas mensajes oficiales
- NO inventes precios para uñas
- NO des información incompleta
- NO compartas números de proveedores
- Precios de limpieza aplican hasta 120 m²
- Servicios adicionales: $15.000/hora (lavado, planchado, paredes, juntas, comida)
- Pagos: durante el servicio, nunca antes
- Cobertura: Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Pereira
- Horarios: L-S desde 8am, Domingos desde 9am
- TODO ES A DOMICILIO
- Las proveedoras llevan su alimentación

# HANDOFF A AGENTE
Pasar a agente humano cuando:
- El cliente lo solicita explícitamente
- Preguntan precio de UÑAS
- Piden portafolio/fotos de uñas
- Hay queja o reclamo
- Tienes todos los datos del servicio listos

Cuando pases a agente, di:
"Estamos confirmando la disponibilidad del proveedor en tu dirección y fecha. Un agente te confirmará en breve 🧡"
`;

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
    
    // 2. INTENT DETECTION (NEW!)
    const intent = detectIntent(messageBody);
    console.log(`[Brain] 🎯 Intent: ${intent.intent} (${(intent.confidence * 100).toFixed(0)}%)`);

    // 3. Check for direct handoff trigger
    if (intent.triggerHandoff) {
      console.log(`[Brain] 🔄 Handoff por intent: ${intent.reason}`);
      await createHandoff(from, intent.reason, summarizeHistory(history), 'high');
      const handoffMsg = intent.exactResponse || getHandoffMessage(intent.reason);
      await sendWhatsAppMessage(phoneNumberId, from, handoffMsg);
      trackEvent(EVENTS.HANDOFF_TRIGGERED, from, { reason: intent.reason }).catch(() => {});
      return;
    }

    // 4. Check for exact response (send directly, skip AI)
    if (intent.exactResponse && intent.confidence >= 0.85) {
      console.log(`[Brain] 📋 Respuesta exacta para: ${intent.intent}`);
      
      // Save to history
      const newHistory = [
        ...history, 
        { role: 'user', parts: [{ text: messageBody }] }, 
        { role: 'model', parts: [{ text: intent.exactResponse }] }
      ];
      await saveConversation(from, newHistory, metadata);
      await sendWhatsAppMessage(phoneNumberId, from, intent.exactResponse);
      return;
    }

    // 5. Booking Intelligence
    const prevBookingData = metadata.bookingData || {};
    const extractedData = extractBookingData(messageBody, prevBookingData);
    
    // Merge with intent-detected service type
    if (intent.serviceType) {
      extractedData.service_type = intent.serviceType;
    }
    if (intent.subType) {
      extractedData.service_subtype = intent.subType;
    }
    
    const bookingData = { ...prevBookingData, ...extractedData };
    
    // Save booking progress if updated
    if (JSON.stringify(bookingData) !== JSON.stringify(prevBookingData)) {
       metadata.bookingData = bookingData;
       trackEvent(EVENTS.BOOKING_STARTED, from, bookingData).catch(() => {});
    }

    // 6. Human Handoff Check (legacy - keep for explicit requests)
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

    // 7. Auto-Booking Creation (when all data is collected)
    if (isBookingComplete(bookingData) && !metadata.bookingCreated) {
      const booking = await createBooking(from, bookingData);
      if (booking) {
        metadata.bookingCreated = true;
        console.log(`[Brain] 📅 Booking guardado en DB: ${booking.id}`);
        trackEvent(EVENTS.BOOKING_CREATED, from, booking).catch(() => {});
        
        // Auto-handoff after booking is complete
        await createHandoff(from, 'booking_confirmation', summarizeHistory(history), 'high');
        await sendWhatsAppMessage(phoneNumberId, from, EXACT_RESPONSES.CONFIRMANDO_DISPONIBILIDAD);
        return;
      }
    }

    // 8. RAG Retrieval (Knowledge Base - for complex queries)
    let ragContext = '';
    try {
      ragContext = await searchKnowledge(messageBody);
      if(ragContext) console.log('[Brain] 🧠 RAG Context found');
    } catch (e) { 
      console.log('[Brain] RAG offline'); 
    }

    // 9. Build AI Context
    const fullContextPrompt = `
${SYSTEM_PROMPT}

INFORMACIÓN ADICIONAL (RAG):
${ragContext || 'No hay info específica adicional.'}

ESTADO DEL AGENDAMIENTO:
${JSON.stringify(bookingData)}

${getBookingPrompt(bookingData)}

HISTORIAL DE CONVERSACIÓN:
${summarizeHistory(history)}

CLIENTE DICE: "${messageBody}"
RESPONDER COMO MIGUEL (máximo 2-3 frases):
`;

    console.log('[Brain] 🤖 Pensando...');
    
    let responseText = '';
    
    // PRIMARY: gemini-2.5-flash
    try {
      const result = await model.generateContent(fullContextPrompt);
      responseText = result.response.text();
    } catch (primaryError) {
      console.warn(`[Brain] ⚠️ Primary model failed (${primaryError.message}). Switch to Fallback.`);
      trackEvent(EVENTS.ERROR, from, { error: 'primary_model_failed', details: primaryError.message }).catch(() => {});
      
      // FALLBACK: gemini-2.0-flash
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

    // 10. Guardar y Responder
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
  await sendWhatsAppMessage(phoneNumberId, to, EXACT_RESPONSES.SALUDO_INICIAL);
}

module.exports = { processIncomingMessage };
