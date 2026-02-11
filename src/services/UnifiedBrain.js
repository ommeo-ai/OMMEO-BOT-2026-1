const { GoogleGenerativeAI } = require('@google/generative-ai');
const { searchKnowledge } = require('./ragService');
const { parseTemporalExpressions } = require('./temporalService'); // ⬅️ NUEVO
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * UnifiedBrain: El cerebro único de OMMEO v12 (MIGUEL ULTRA SENIOR).
 * Procesa historial, contexto de reserva, RAG y TEMPORAL para decisiones precisas.
 */
async function processThought(text, history = [], currentBooking = {}) {
    console.log(`[UnifiedBrain] 🧠 Pensando respuesta para: "${text}"`);
    
    // 0. CONTEXTO TEMPORAL (Date Awareness)
    const now = new Date();
    const dateOptions = { 
        timeZone: 'America/Bogota', 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    const fechaActual = now.toLocaleDateString('es-CO', dateOptions);

    // ⬇️⬇️⬇️ NUEVO: PARSER TEMPORAL DETERMINÍSTICO ⬇️⬇️⬇️
    const temporalData = parseTemporalExpressions(text);
    console.log(`[Cerebro] 🕒 Tiempo Detectado: ${temporalData.date} ${temporalData.time} (Confianza: ${temporalData.confidence})`);
    
    // Pre-llenar currentBooking si detectamos fecha/hora con confianza >= 50%
    if (temporalData.date && temporalData.confidence >= 0.5) {
        currentBooking.service_date = temporalData.date;
        console.log(`[Cerebro] ✅ Fecha pre-llenada: ${temporalData.date}`);
    }
    if (temporalData.time && temporalData.confidence >= 0.5) {
        currentBooking.service_time = temporalData.time;
        console.log(`[Cerebro] ✅ Hora pre-llenada: ${temporalData.time}`);
    }
    // ⬆️⬆️⬆️ FIN NUEVO ⬆️⬆️⬆️

    // 1. Obtener contexto RAG v11 (Waterfall Search)
    let ragContext = "";
    try {
        const ragResults = await searchKnowledge(text);
        if (ragResults && ragResults.length > 0) {
            ragContext = ragResults.map(r => 
                `[INFO ${r.metadata?.category || 'General'}]: ${r.content}`
            ).join("\n---\n");
        }
    } catch (e) {
        console.warn(`[UnifiedBrain] ⚠️ RAG Omitido (Modo Seguro): ${e.message}`);
    }

    // 2. Construir el Prompt Maestro Imperativo (v12 - CON TEMPORAL)
    const systemPrompt = `TU NOMBRE: Miguel (bot de OMMEO).
ERES UN ASISTENTE DETERMINÍSTICO. TU PRIORIDAD ES LA EXACTITUD SOBRE LA CREATIVIDAD.

REGLAS ABSOLUTAS (NO NEGOCIABLES):
1. **CERO INVENTIVA:** NUNCA inventes precios, horarios o servicios que no estén explícitamente en el [CONTEXTO RAG] abajo.
2. **CERO CONFIRMACIÓN:** NUNCA digas "confirmado" o "agendado". Solo recolecta datos (Tipo, Fecha, Dir).
3. **FIDELIDAD:** Si el RAG dice un precio exacto, úsalo literal.
4. **FALLBACK:** Si la info no está en el RAG → "Disculpa, para ese detalle debo consultarlo con un asesor. ¿Deseas que te transfiera?"

[CONTEXTO RAG]:
${ragContext || "No hay información específica. Usa las categorías generales: Limpieza, Mascotas, Uñas, Barbería."}

DATOS ACTUALES DE LA RESERVA (Variable Crítica):
${JSON.stringify(currentBooking, null, 2)}

FECHA ACTUAL DEL SISTEMA: ${fechaActual}

📅 DATOS TEMPORALES PRE-PROCESADOS (CRÍTICO):
${temporalData.date ? `✅ Fecha detectada: ${temporalData.date}` : '❌ No se detectó fecha'}
${temporalData.time ? `✅ Hora detectada: ${temporalData.time}` : '❌ No se detectó hora'}
${temporalData.readable ? `📌 Para el usuario: "${temporalData.readable}"` : ''}
Confianza: ${(temporalData.confidence * 100).toFixed(0)}%

⚠️ REGLA TEMPORAL CRÍTICA:
- SI confianza >= 50% Y fecha/hora detectadas → NO VUELVAS A PREGUNTARLAS
- En su lugar, CONFIRMA: "Perfecto, para el ${temporalData.readable}. Ahora necesito la dirección completa del servicio..."
- Si confianza < 50% → Pregunta: "¿Para qué fecha y hora te gustaría agendar?"

FLUJO DE AGENDAMIENTO (LIMPIEZA):
1. Confirmar tipo de servicio (Básica/General/Profunda/Full)
2. Capturar fecha y hora (o usar temporalData si existe)
3. Capturar dirección completa
4. Cuando tengas TODO → handoff: true

SALIDA JSON OBLIGATORIA:
{
  "response": "Texto claro y profesional para el usuario (máximo 3 líneas)...",
  "new_entities": { 
    "service_type": "básica|general|profunda|full", 
    "date": "YYYY-MM-DD", 
    "TIME": "HH:mm", 
    "address": "Dirección completa con ciudad" 
  },
  "intent": "BOOKING" | "INFO" | "CHITCHAT" | "GREETING",
  "is_complete": boolean,
  "handoff": boolean
}`;

    try {
        console.log(`[UnifiedBrain] 🚀 Solicitando a Gemini (v1.5-flash)...`);
        
        const generationConfig = { 
            responseMimeType: "application/json",
            temperature: 0.1 // Muy bajo para ser determinístico
        };
        
        const finalPrompt = `${systemPrompt}\n\nHISTORIAL RECIENTE:\n${history.slice(-5).map(h => `${h.role}: ${h.content}`).join('\n')}\n\nUSUARIO ACTUAL: ${text}`;

        let cleanText = "";
        
        try {
            const { model: geminiModel } = require('../config/geminiClient');
            if (!geminiModel) throw new Error("Gemini Model not initialized");

            console.log(`[UnifiedBrain] 🤖 Usando modelo: ${geminiModel.model}`);
            const result = await geminiModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: finalPrompt }]}],
                generationConfig
            });
            cleanText = result.response.text().trim();
            console.log(`[UnifiedBrain] 📥 Respuesta Cruda Recibida: ${cleanText.substring(0, 150)}...`);
        } catch (geminiError) {
            console.error('[UnifiedBrain] ⚠️ Gemini Direct falló:', geminiError.message);
            console.error('[UnifiedBrain] 🔄 Intentando RESPALDO (OpenRouter)...');
            
            if (process.env.OPENROUTER_API_KEY) {
                const axios = require('axios');
                const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                    model: "google/gemini-flash-1.5",
                    messages: [
                        { role: "system", content: "Responde siempre en formato JSON puro sin markdown." },
                        { role: "user", content: finalPrompt }
                    ],
                    response_format: { type: "json_object" }
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                });
                
                cleanText = response.data.choices[0].message.content.trim();
                console.log('[UnifiedBrain] ✅ Respaldo OpenRouter exitoso.');
            } else {
                throw new Error("Gemini falló y no hay respaldo configurado");
            }
        }

        // LIMPIEZA DE MARKDOWN (CRÍTICO)
        if (cleanText.includes('```')) {
            cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        
        const parsed = JSON.parse(cleanText);

        // 3. BLINDAJE ANTI-ALUCINACIÓN (Capa Final de Seguridad)
        try {
            const { validateResponse } = require('./antiHallucination');
            const validation = validateResponse(parsed.response, { 
                allowedPrices: ["$77.000", "$107.000", "$122.000", "$137.000", "$15.000", "$35.000", "$50.000", "$130.000"]
            });

            if (!validation.valid) {
                console.warn('[UnifiedBrain] ⚠️ Validación fallida, usando fallback');
                parsed.response = validation.fallback;
            }
        } catch (validationError) {
            console.warn('[UnifiedBrain] ⚠️ Validación omitida (módulo no disponible)');
        }

        return parsed;
    } catch (error) {
        console.error('[UnifiedBrain] ❌ ERROR CRÍTICO TOTAL:', error);
        return { 
            response: "Disculpa, estoy teniendo problemas técnicos. Dame un momento mientras me recargo. 🧡", 
            intent: "ERROR",
            handoff: false
        }; 
    }
}

module.exports = { processThought };
