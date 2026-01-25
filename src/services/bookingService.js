const { supabase } = require('../config/supabaseClient');
const axios = require('axios');

// Booking intent detection patterns
const BOOKING_PATTERNS = {
  service: {
    limpieza: /limpi(eza|ar|o)|aseo|hogar/i,
    mascotas: /mascot|perr|gat|pet|paseo/i,
    unas: /uña|manicur|pedicur|acril/i,
    barberia: /barb|cort|afeit|pelo|cabello/i
  },
  date: /hoy|mañana|lunes|martes|miercoles|jueves|viernes|sabado|domingo|\d{1,2}[\/\-]\d{1,2}/i,
  time: /\d{1,2}:\d{2}|\d{1,2}\s*(am|pm)|mañana|tarde|noche/i,
  zone: /zona|barrio|sector|cerca|ubicad|direcci/i
};

/**
 * Analyze message for booking intent
 * @param {string} message - User message
 * @param {object} currentData - Existing booking data
 * @returns {object} - Extracted booking data
 */
function extractBookingData(message, currentData = {}) {
  const data = { ...currentData };

  // Detect service type
  for (const [service, pattern] of Object.entries(BOOKING_PATTERNS.service)) {
    if (pattern.test(message)) {
      data.service_type = service;
      break;
    }
  }

  // Detect date
  if (BOOKING_PATTERNS.date.test(message)) {
    const dateMatch = message.match(BOOKING_PATTERNS.date);
    if (dateMatch) {
      data.requested_date = parseDateExpression(dateMatch[0]);
    }
  }

  // Detect time
  if (BOOKING_PATTERNS.time.test(message)) {
    const timeMatch = message.match(BOOKING_PATTERNS.time);
    if (timeMatch) {
      data.requested_time = timeMatch[0];
    }
  }

  return data;
}

/**
 * Parse date expressions to ISO format
 */
function parseDateExpression(expr) {
  const today = new Date();
  const lower = expr.toLowerCase();

  if (lower === 'hoy') {
    return today.toISOString().split('T')[0];
  }
  if (lower === 'mañana') {
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  }

  // Handle day names
  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const dayIndex = days.findIndex(d => lower.includes(d));
  if (dayIndex >= 0) {
    const currentDay = today.getDay();
    const daysUntil = (dayIndex - currentDay + 7) % 7 || 7;
    today.setDate(today.getDate() + daysUntil);
    return today.toISOString().split('T')[0];
  }

  return expr; // Return as-is if can't parse
}

/**
 * Check if we have enough data to create a booking
 */
function isBookingComplete(data) {
  return data.service_type && data.requested_date;
}

/**
 * Get missing booking fields
 */
function getMissingFields(data) {
  const missing = [];
  if (!data.service_type) missing.push('servicio');
  if (!data.requested_date) missing.push('fecha');
  if (!data.zone) missing.push('zona/barrio');
  return missing;
}

/**
 * Create a booking in Supabase
 */
async function createBooking(phoneNumber, bookingData) {
  if (!supabase) {
    console.warn('[Booking] Supabase not available');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        phone_number: phoneNumber,
        service_type: bookingData.service_type,
        requested_date: bookingData.requested_date,
        requested_time: bookingData.requested_time,
        zone: bookingData.zone,
        notes: bookingData.notes,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`[Booking] ✅ Created booking ${data.id}`);

    // Notify admin panel (if webhook configured)
    await notifyAdminPanel(data);

    return data;

  } catch (error) {
    console.error('[Booking] ❌ Error:', error.message);
    return null;
  }
}

/**
 * Notify admin panel about new booking
 */
async function notifyAdminPanel(booking) {
  const webhookUrl = process.env.ADMIN_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await axios.post(webhookUrl, {
      type: 'new_booking',
      data: booking,
      timestamp: new Date().toISOString()
    }, {
      timeout: 5000
    });
    console.log('[Booking] 📤 Admin notified');
  } catch (e) {
    console.warn('[Booking] Admin notification failed:', e.message);
  }
}

/**
 * Get booking status prompt for AI
 */
function getBookingPrompt(bookingData) {
  const missing = getMissingFields(bookingData);
  
  if (missing.length === 0) {
    return `[BOOKING_READY] El cliente ya proporcionó todos los datos. Servicio: ${bookingData.service_type}, Fecha: ${bookingData.requested_date}, Zona: ${bookingData.zone || 'pendiente'}. Confirma y di que los pasarás con una asesora.`;
  }

  return `[BOOKING_PROGRESS] Datos capturados: ${JSON.stringify(bookingData)}. Falta: ${missing.join(', ')}. Pregunta por lo que falta de forma natural.`;
}

module.exports = {
  extractBookingData,
  isBookingComplete,
  getMissingFields,
  createBooking,
  getBookingPrompt
};
