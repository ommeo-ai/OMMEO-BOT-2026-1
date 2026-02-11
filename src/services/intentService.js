/**
 * ============================================
 * INTENT DETECTION SERVICE
 * ============================================
 * Detects user intent and provides appropriate responses
 */

const { EXACT_RESPONSES, FAQ, INTENT_PATTERNS } = require('../data/knowledgeBase');

/**
 * Detect the primary intent of a message
 * @param {string} message - User message
 * @param {object} context - Conversation context (e.g., last_service_type)
 * @returns {object} - { intent, confidence, exactResponse }
 */
function detectIntent(message, context = {}) {
  const msg = message.toLowerCase().trim();
  
  // 0. CONTEXTUAL OVERRIDES (High Priority)
  // Fix for "profunda" -> Uñas vs Limpieza ambiguity
  if (context.last_service_type === 'limpieza') {
    if (INTENT_PATTERNS.LIMPIEZA_PROFUNDA.test(msg) || /\bprofunda\b/.test(msg)) {
      return { intent: 'LIMPIEZA_PROFUNDA', confidence: 0.95, serviceType: 'limpieza', subType: 'profunda' };
    }
    if (INTENT_PATTERNS.LIMPIEZA_GENERAL.test(msg) || /\bgeneral\b/.test(msg)) {
      return { intent: 'LIMPIEZA_GENERAL', confidence: 0.95, serviceType: 'limpieza', subType: 'general' };
    }
  }
  
  // Check for exact greeting
  if (INTENT_PATTERNS.SALUDO.test(msg)) {
    return { intent: 'SALUDO', confidence: 1.0, exactResponse: EXACT_RESPONSES.SALUDO_INICIAL };
  }

  // Check for handoff triggers first (highest priority)
  if (INTENT_PATTERNS.HANDOFF_EXPLICITO.test(msg)) {
    return { intent: 'HANDOFF_EXPLICITO', confidence: 1.0, triggerHandoff: true, reason: 'user_request' };
  }

  // Check for complaint
  if (INTENT_PATTERNS.QUEJA.test(msg)) {
    return { intent: 'QUEJA', confidence: 0.9, exactResponse: EXACT_RESPONSES.QUEJA };
  }

  // Check for payment confirmation
  if (INTENT_PATTERNS.COMPROBANTE.test(msg)) {
    return { intent: 'COMPROBANTE', confidence: 0.95, exactResponse: EXACT_RESPONSES.COMPROBANTE_PAGO };
  }

  // Check for work/employment inquiry
  if (INTENT_PATTERNS.TRABAJO.test(msg)) {
    // Check if they're asking about registration
    if (INTENT_PATTERNS.REGISTRO_PROVEEDOR.test(msg)) {
      if (/ya.*registr|no.*deja|no.*funciona/i.test(msg)) {
        return { intent: 'YA_REGISTRADO', confidence: 0.9, exactResponse: EXACT_RESPONSES.YA_REGISTRADO };
      }
      return { intent: 'REGISTRO_PROVEEDOR', confidence: 0.9, exactResponse: EXACT_RESPONSES.REGISTRO_PROVEEDOR };
    }
    return { intent: 'TRABAJO', confidence: 0.95, exactResponse: EXACT_RESPONSES.TRABAJO };
  }

  // Check for reschedule/cancel
  if (INTENT_PATTERNS.REAGENDAR.test(msg)) {
    return { intent: 'REAGENDAR', confidence: 0.9, exactResponse: EXACT_RESPONSES.REAGENDAR };
  }
  
  if (INTENT_PATTERNS.CANCELAR.test(msg)) {
    // Check if definitive cancel or asking
    if (/definitiv|ya no|no quiero reagend/i.test(msg)) {
      return { intent: 'CANCELAR_CONFIRMADO', confidence: 0.9, exactResponse: EXACT_RESPONSES.CANCELAR_CONFIRMADO, triggerHandoff: true, reason: 'cancelacion' };
    }
    return { intent: 'CANCELAR', confidence: 0.9, exactResponse: EXACT_RESPONSES.CANCELAR_PREGUNTA };
  }

  // Check for subscription inquiry
  if (INTENT_PATTERNS.SUSCRIPCION.test(msg)) {
    return { intent: 'SUSCRIPCION', confidence: 0.9, exactResponse: EXACT_RESPONSES.SUSCRIPCIONES };
  }

  // Check for felicitation
  if (INTENT_PATTERNS.FELICITACION.test(msg)) {
    return { intent: 'FELICITACION', confidence: 0.8, exactResponse: EXACT_RESPONSES.FELICITACION };
  }

  // --- SERVICE INTENTS ---
  
  // Check for nail price inquiry (HANDOFF)
  if (INTENT_PATTERNS.PRECIO_UNAS.test(msg)) {
    return { intent: 'UNAS_PRECIO', confidence: 0.95, exactResponse: EXACT_RESPONSES.HANDOFF_UNAS_PRECIO, triggerHandoff: true, reason: 'pricing_unas' };
  }

  // Check for photos/portfolio request (context matters)
  if (INTENT_PATTERNS.FOTOS.test(msg)) {
    // If about nails, handoff
    if (INTENT_PATTERNS.UNAS.test(msg) || /u[ñn]a|manicur/i.test(msg)) {
      return { intent: 'UNAS_FOTOS', confidence: 0.9, exactResponse: EXACT_RESPONSES.HANDOFF_UNAS_FOTOS, triggerHandoff: true, reason: 'portfolio_unas' };
    }
    // Generic photo received
    return { intent: 'FOTO_RECIBIDA', confidence: 0.8, exactResponse: EXACT_RESPONSES.FOTO_RECIBIDA, triggerHandoff: true, reason: 'foto_recibida' };
  }

  // Office cleaning (before regular cleaning)
  if (INTENT_PATTERNS.LIMPIEZA_OFICINA.test(msg)) {
    return { intent: 'LIMPIEZA_OFICINAS', confidence: 0.95, exactResponse: EXACT_RESPONSES.LIMPIEZA_OFICINAS };
  }

  // Regular cleaning
  if (INTENT_PATTERNS.LIMPIEZA.test(msg)) {
    // Check for subtypes
    if (INTENT_PATTERNS.LIMPIEZA_BASICA.test(msg)) {
      return { intent: 'LIMPIEZA_BASICA', confidence: 0.9, serviceType: 'limpieza', subType: 'basica' };
    }
    if (INTENT_PATTERNS.LIMPIEZA_GENERAL.test(msg)) {
      return { intent: 'LIMPIEZA_GENERAL', confidence: 0.9, serviceType: 'limpieza', subType: 'general' };
    }
    if (INTENT_PATTERNS.LIMPIEZA_PROFUNDA.test(msg)) {
      return { intent: 'LIMPIEZA_PROFUNDA', confidence: 0.9, serviceType: 'limpieza', subType: 'profunda' };
    }
    if (INTENT_PATTERNS.LIMPIEZA_FULL.test(msg)) {
      return { intent: 'LIMPIEZA_FULL', confidence: 0.9, serviceType: 'limpieza', subType: 'full' };
    }
    // Generic cleaning inquiry
    return { intent: 'LIMPIEZA', confidence: 0.95, exactResponse: EXACT_RESPONSES.LIMPIEZA };
  }

  // Nails (no price)
  if (INTENT_PATTERNS.UNAS.test(msg)) {
    return { intent: 'UNAS', confidence: 0.95, exactResponse: EXACT_RESPONSES.UNAS };
  }

  // Pets
  if (INTENT_PATTERNS.MASCOTAS.test(msg)) {
    return { intent: 'MASCOTAS', confidence: 0.95, exactResponse: EXACT_RESPONSES.MASCOTAS };
  }

  // Barber
  if (INTENT_PATTERNS.BARBERIA.test(msg)) {
    return { intent: 'BARBERIA', confidence: 0.95, exactResponse: EXACT_RESPONSES.BARBERIA };
  }

  // --- FAQ MATCHING ---
  const faqMatch = matchFAQ(msg);
  if (faqMatch) {
    return { intent: 'FAQ', confidence: 0.85, exactResponse: faqMatch.answer };
  }

  // No clear intent - let AI handle
  return { intent: 'UNKNOWN', confidence: 0.0 };
}

/**
 * Match message against FAQ entries
 */
function matchFAQ(message) {
  for (const [key, faq] of Object.entries(FAQ)) {
    for (const trigger of faq.triggers) {
      if (message.includes(trigger.toLowerCase())) {
        return faq;
      }
    }
  }
  return null;
}

/**
 * Check if message contains booking flow data
 */
function isBookingFlowMessage(message, currentState) {
  // Date/time patterns
  const datePattern = /hoy|mañana|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|\d{1,2}[\/-]\d{1,2}/i;
  const timePattern = /\d{1,2}:\d{2}|\d{1,2}\s*(am|pm)|mañana|tarde|noche/i;
  const addressPattern = /calle|carrera|avenida|cra|cl|av|diagonal|transversal|barrio|apartamento|apto|edificio|piso/i;
  const paymentPattern = /efectivo|tarjeta|transferencia|pse|nequi|bancolombia/i;

  if (datePattern.test(message) || timePattern.test(message)) {
    return { type: 'date_time', detected: true };
  }
  if (addressPattern.test(message)) {
    return { type: 'address', detected: true };
  }
  if (paymentPattern.test(message)) {
    return { type: 'payment', detected: true };
  }

  return { detected: false };
}

module.exports = {
  detectIntent,
  matchFAQ,
  isBookingFlowMessage
};
