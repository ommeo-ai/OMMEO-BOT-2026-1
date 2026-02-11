const chrono = require('chrono-node');

const TEMPORAL_PATTERNS = {
  "mañana en la mañana": { offset: 1, hour: 8 },
  "mañana en la tarde": { offset: 1, hour: 14 },
  "mañana en la noche": { offset: 1, hour: 18 },
  "pasado mañana": { offset: 2, hour: null },
  "tmr": { offset: 1, hour: null },
};

function parseTemporalExpression(text) {
  if (!text) return null;
  const lowerText = text.toLowerCase();
  
  // 1. Custom Pattern Matching (for colloquialisms chrono misses)
  for (const [pattern, config] of Object.entries(TEMPORAL_PATTERNS)) {
    if (lowerText.includes(pattern)) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + config.offset);
      
      return {
        date: targetDate.toISOString().split('T')[0], // YYYY-MM-DD
        time: config.hour ? `${config.hour}:00` : null,
        confidence: 0.95,
        source: 'pattern'
      };
    }
  }
  
  // 2. Chrono-node Parsing (General NLP)
  // Use 'es' locale if available, else standard (default is strictly EN, need ES support or specific config)
  // Chrono supports ES via chrono.es
  const parsed = chrono.es.parse(text, new Date(), { forwardDate: true });
  
  if (parsed.length > 0) {
    const result = parsed[0];
    const date = result.start.date();
    
    // Check if time is implied/explicit
    const timeKnown = result.start.isCertain('hour');
    const time = timeKnown 
      ? `${result.start.get('hour')}:${String(result.start.get('minute')).padStart(2, '0')}`
      : null;

    return {
      date: date.toISOString().split('T')[0],
      time: time,
      confidence: 0.85,
      source: 'chrono'
    };
  }
  
  return null;
}

module.exports = { parseTemporalExpression };
