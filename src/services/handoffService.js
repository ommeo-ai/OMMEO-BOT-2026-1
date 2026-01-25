const { supabase } = require('../config/supabaseClient');
const axios = require('axios');

// Triggers for human handoff (REFINED - less aggressive)
const HANDOFF_TRIGGERS = {
  explicit: /quiero hablar con (?:una? )?(?:persona|humano|agente|asesora?)|ayuda real|alguien real|pasame con/i,
  complaint: /queja formal|reclamo oficial|mal servicio|muy insatisf|problema grave|denuncia/i,
  confusion: /no entiendo nada|no funciona para nada|muchos errores/i,
  pricing: /cuanto (?:cuesta|vale|cobran)|precio (?:de|del|para)|cotiza(?:cion|me)|tarifa/i
};

/**
 * Check if message triggers handoff
 */
function shouldHandoff(message, conversationContext = {}) {
  // Explicit request for human
  if (HANDOFF_TRIGGERS.explicit.test(message)) {
    return { trigger: true, reason: 'user_request', priority: 'high' };
  }

  // Complaint detected
  if (HANDOFF_TRIGGERS.complaint.test(message)) {
    return { trigger: true, reason: 'complaint', priority: 'urgent' };
  }

  // Pricing question (always handoff to sales)
  if (HANDOFF_TRIGGERS.pricing.test(message)) {
    return { trigger: true, reason: 'pricing_inquiry', priority: 'medium' };
  }

  // Repeated confusion
  if (conversationContext.confusionCount >= 2 && HANDOFF_TRIGGERS.confusion.test(message)) {
    return { trigger: true, reason: 'user_confusion', priority: 'medium' };
  }

  // DISABLED: Auto-handoff interrupts Gemini response. Let AI confirm booking first.
  // if (conversationContext.bookingComplete) {
  //   return { trigger: true, reason: 'booking_confirmation', priority: 'high' };
  // }

  return { trigger: false };
}

/**
 * Create handoff record and notify
 */
async function createHandoff(phoneNumber, reason, conversationSummary, priority = 'medium') {
  if (!supabase) {
    console.warn('[Handoff] Supabase not available');
    return null;
  }

  try {
    // Create handoff record
    const { data, error } = await supabase
      .from('handoffs')
      .insert({
        phone_number: phoneNumber,
        reason,
        priority,
        conversation_summary: conversationSummary,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`[Handoff] ✅ Created handoff ${data.id} (${priority})`);

    // Update conversation status
    await supabase
      .from('conversations')
      .update({ status: 'handoff' })
      .eq('phone_number', phoneNumber);

    // Notify admin
    await notifyHandoff(data);

    return data;

  } catch (error) {
    console.error('[Handoff] ❌ Error:', error.message);
    return null;
  }
}

/**
 * Notify admin about handoff
 */
async function notifyHandoff(handoff) {
  const webhookUrl = process.env.ADMIN_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await axios.post(webhookUrl, {
      type: 'handoff_request',
      data: handoff,
      timestamp: new Date().toISOString()
    }, {
      timeout: 5000
    });
    console.log('[Handoff] 📤 Admin notified');
  } catch (e) {
    console.warn('[Handoff] Admin notification failed:', e.message);
  }
}

/**
 * Get handoff response message
 */
function getHandoffMessage(reason) {
  const messages = {
    user_request: '🧡 Perfecto, te paso con una asesora de OMMEO que te contactará en menos de 2 minutos.',
    complaint: '🧡 Lamento mucho lo que me cuentas. Te paso inmediatamente con un supervisor que te ayudará a resolver esto.',
    pricing_inquiry: '🧡 Para darte el precio exacto, te paso con una asesora que te cotizará en segundos.',
    user_confusion: '🧡 Disculpa si no fui claro. Te paso con una asesora que te ayudará mejor.',
    booking_confirmation: '🧡 ¡Excelente! Te paso con una asesora para confirmar todos los detalles y agendar tu servicio.'
  };

  return messages[reason] || messages.user_request;
}

module.exports = {
  shouldHandoff,
  createHandoff,
  getHandoffMessage
};
