const { supabase } = require('../config/supabaseClient');
const axios = require('axios');

// ============================================
// HANDOFF TRIGGERS - REFINED FOR OMMEO
// ============================================
// Key change: Removed generic pricing trigger
// Now only handoff for UÑAS pricing (handled by intentService)
const HANDOFF_TRIGGERS = {
  // Explicit request for human agent
  explicit: /quiero hablar con (?:una? )?(?:persona|humano|agente|asesora?)|ayuda real|alguien real|pasame con|p[aá]same con/i,
  
  // Complaints and issues
  complaint: /queja formal|reclamo oficial|mal servicio|muy insatisf|problema grave|denuncia|estafa|robo|demanda/i,
  
  // Confusion (only after multiple attempts)
  confusion: /no entiendo nada|no funciona para nada|muchos errores|no me ayuda/i
};

/**
 * Check if message triggers handoff
 * NOTE: Pricing handoff for UÑAS is now handled by intentService
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

  // Repeated confusion (>= 2 confusing messages)
  if (conversationContext.confusionCount >= 2 && HANDOFF_TRIGGERS.confusion.test(message)) {
    return { trigger: true, reason: 'user_confusion', priority: 'medium' };
  }

  // NOTE: Booking complete handoff is now handled in messageProcessor.js
  // after booking is saved to database

  return { trigger: false };
}

/**
 * Create handoff record and notify admin
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
    user_request: '🧡 Perfecto, te paso con una asesora de OMMEO que te contactará en breve.',
    complaint: '🧡 Lamento mucho lo que me cuentas. Te paso inmediatamente con un supervisor que te ayudará a resolver esto.',
    user_confusion: '🧡 Disculpa si no fui claro. Te paso con una asesora que te ayudará mejor.',
    booking_confirmation: '🧡 ¡Excelente! Estamos confirmando la disponibilidad del proveedor en tu dirección y fecha. Un agente te confirmará en breve.',
    pricing_unas: '🧡 Para darte el precio exacto de tu servicio de uñas, te paso con una asesora que te cotizará en segundos.',
    portfolio_unas: '🧡 Claro que sí, te contactaré con un agente para enviarte referentes en imagen del trabajo de nuestro proveedor.',
    foto_recibida: '🧡 Gracias por la foto. Le enviaremos la imagen a nuestro proveedor para obtener el precio del servicio.',
    cancelacion: '🧡 Entendido, procederé a contactar a un asesor para confirmar la cancelación.'
  };

  return messages[reason] || messages.user_request;
}

module.exports = {
  shouldHandoff,
  createHandoff,
  getHandoffMessage
};
