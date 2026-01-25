const { supabase } = require('../config/supabaseClient');

// Event types
const EVENTS = {
  MESSAGE_RECEIVED: 'message_received',
  AI_RESPONSE: 'ai_response',
  BOOKING_STARTED: 'booking_started',
  BOOKING_CREATED: 'booking_created',
  HANDOFF_TRIGGERED: 'handoff_triggered',
  ERROR: 'error'
};

/**
 * Track an analytics event
 */
async function trackEvent(eventType, phoneNumber, data = {}) {
  if (!supabase) {
    console.log(`[Analytics] ${eventType} (offline)`);
    return;
  }

  try {
    await supabase
      .from('analytics')
      .insert({
        event_type: eventType,
        phone_number: phoneNumber,
        data: {
          ...data,
          timestamp: new Date().toISOString()
        }
      });

    console.log(`[Analytics] 📊 ${eventType}`);
  } catch (error) {
    console.warn('[Analytics] Track failed:', error.message);
  }
}

/**
 * Update lead score for a conversation
 */
async function updateLeadScore(phoneNumber, delta) {
  if (!supabase) return;

  try {
    // Get current score
    const { data: conv } = await supabase
      .from('conversations')
      .select('lead_score')
      .eq('phone_number', phoneNumber)
      .single();

    const newScore = Math.max(0, Math.min(100, (conv?.lead_score || 0) + delta));

    await supabase
      .from('conversations')
      .update({ lead_score: newScore })
      .eq('phone_number', phoneNumber);

    console.log(`[Analytics] Lead score: ${newScore}`);
  } catch (e) {
    console.warn('[Analytics] Score update failed');
  }
}

/**
 * Score deltas for different actions
 */
const SCORE_DELTAS = {
  message: 2,
  service_inquiry: 5,
  date_provided: 10,
  booking_complete: 25,
  handoff_pricing: 15,
  converted: 50
};

/**
 * Get analytics summary for a phone number
 */
async function getConversationStats(phoneNumber) {
  if (!supabase) return null;

  try {
    const { data, count } = await supabase
      .from('analytics')
      .select('event_type', { count: 'exact' })
      .eq('phone_number', phoneNumber);

    return {
      totalEvents: count,
      events: data
    };
  } catch (e) {
    return null;
  }
}

module.exports = {
  EVENTS,
  SCORE_DELTAS,
  trackEvent,
  updateLeadScore,
  getConversationStats
};
