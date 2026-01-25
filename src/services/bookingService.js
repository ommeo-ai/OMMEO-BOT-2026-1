const { supabase } = require('../config/supabaseClient');
const axios = require('axios');

// ============================================
// BOOKING PATTERNS - ENHANCED
// ============================================
const BOOKING_PATTERNS = {
  service: {
    limpieza: /limpi(eza|ar|o)|aseo|hogar/i,
    mascotas: /mascot|perr|gat|pet|paseo|peluquer[ií]a.*mascot/i,
    unas: /u[ñn]a|manicur|pedicur|acr[ií]l|semipermanente/i,
    barberia: /barb|cort.*pelo|cort.*cabello|afeit/i
  },
  // Subtypes for limpieza
  limpiezaSubtype: {
    basica: /b[aá]sica|4\s*h(ora)?s?/i,
    general: /general|7\s*h(ora)?s?/i,
    profunda: /profunda|8\s*h(ora)?s?/i,
    full: /full|completa|9\s*h(ora)?s?/i
  },
  date: /hoy|mañana|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|\d{1,2}[\/-]\d{1,2}/i,
  time: /\d{1,2}:\d{2}|\d{1,2}\s*(am|pm)|mañana|tarde|noche/i,
  address: /calle|carrera|avenida|cra|cl|av|diagonal|transversal/i,
  city: /bogot[aá]|medell[ií]n|cali|barranquilla|cartagena|bucaramanga|pereira|rionegro|la ceja/i,
  payment: /efectivo|tarjeta|transferencia|pse|nequi|bancolombia|d[eé]bito|cr[eé]dito/i
};

// Limpieza prices
const LIMPIEZA_PRICES = {
  basica: 77000,
  general: 107000,
  profunda: 122000,
  full: 137000
};

/**
 * Analyze message for booking intent
 * @param {string} message - User message
 * @param {object} currentData - Existing booking data
 * @returns {object} - Extracted booking data
 */
function extractBookingData(message, currentData = {}) {
  const data = { ...currentData };
  const messageLower = message.toLowerCase();

  // Detect service type
  for (const [service, pattern] of Object.entries(BOOKING_PATTERNS.service)) {
    if (pattern.test(message)) {
      data.service_type = service;
      break;
    }
  }

  // Detect limpieza subtype
  if (data.service_type === 'limpieza') {
    for (const [subtype, pattern] of Object.entries(BOOKING_PATTERNS.limpiezaSubtype)) {
      if (pattern.test(message)) {
        data.service_subtype = subtype;
        data.service_price = LIMPIEZA_PRICES[subtype];
        break;
      }
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

  // Detect city
  if (BOOKING_PATTERNS.city.test(message)) {
    const cityMatch = message.match(BOOKING_PATTERNS.city);
    if (cityMatch) {
      data.city = cityMatch[0];
    }
  }

  // Detect address
  if (BOOKING_PATTERNS.address.test(message)) {
    // Store the full message as potential address if it contains address keywords
    data.address_raw = message;
  }

  // Detect payment method
  if (BOOKING_PATTERNS.payment.test(message)) {
    const paymentMatch = message.match(BOOKING_PATTERNS.payment);
    if (paymentMatch) {
      data.payment_method = paymentMatch[0];
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
 * For OMMEO: service + date + address is minimum
 */
function isBookingComplete(data) {
  const hasService = data.service_type;
  const hasDate = data.requested_date;
  const hasAddress = data.address_raw || data.city;
  
  // For limpieza, also need subtype
  if (data.service_type === 'limpieza' && !data.service_subtype) {
    return false;
  }
  
  return hasService && hasDate && hasAddress;
}

/**
 * Get missing booking fields
 */
function getMissingFields(data) {
  const missing = [];
  
  if (!data.service_type) {
    missing.push('servicio');
  } else if (data.service_type === 'limpieza' && !data.service_subtype) {
    missing.push('tipo de limpieza (Básica/General/Profunda/Full)');
  }
  
  if (!data.requested_date) missing.push('fecha');
  if (!data.requested_time) missing.push('hora');
  if (!data.address_raw && !data.city) missing.push('dirección completa');
  
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
        service_subtype: bookingData.service_subtype,
        service_price: bookingData.service_price,
        requested_date: bookingData.requested_date,
        requested_time: bookingData.requested_time,
        city: bookingData.city,
        address: bookingData.address_raw,
        payment_method: bookingData.payment_method,
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
  
  if (Object.keys(bookingData).length === 0) {
    return '[BOOKING_START] El cliente aún no ha indicado qué servicio necesita.';
  }
  
  if (missing.length === 0) {
    return `[BOOKING_READY] ¡Tengo todos los datos! 
Servicio: ${bookingData.service_type}${bookingData.service_subtype ? ` (${bookingData.service_subtype})` : ''}
Fecha: ${bookingData.requested_date}
Hora: ${bookingData.requested_time || 'pendiente'}
Dirección: ${bookingData.address_raw || bookingData.city}
Pago: ${bookingData.payment_method || 'pendiente'}

Confirma y PASA A UN AGENTE para finalizar.`;
  }

  return `[BOOKING_PROGRESS] Datos capturados: ${JSON.stringify(bookingData)}.
Falta preguntar: ${missing.join(', ')}.
Pregunta por lo que falta de forma natural (UNA pregunta a la vez).`;
}

module.exports = {
  extractBookingData,
  isBookingComplete,
  getMissingFields,
  createBooking,
  getBookingPrompt
};
