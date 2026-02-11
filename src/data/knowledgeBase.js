/**
 * ============================================
 * OMMEO KNOWLEDGE BASE - PROFESSIONAL EDITION
 * ============================================
 * Base de conocimiento estructurada para el bot Miguel
 * Última actualización: 2026-01-25
 */

// ============================================
// RESPUESTAS EXACTAS (COPIAR LITERALMENTE)
// ============================================
const EXACT_RESPONSES = {
  
  // Saludo inicial y categorías
  SALUDO_INICIAL: `¡Hola! 👋 Soy Miguel, ¿qué servicio te interesa? (Limpieza 🏠, Mascotas 🐶, Uñas 💅, Barbería 💈)`,
  
  // LIMPIEZA - Mensaje oficial completo
  LIMPIEZA: `¡Hola! 👋 Bienvenido/a a OMMEO 🧡
Estos son nuestros servicios de limpieza:

✨ Limpieza Full (9h)
Incluye todo lo de la General + 2 zonas especiales (o 2h en una sola): paredes, juntas, planchado, lavado ropa, comida o clóset.
Valor: $137.000

💎 Limpieza Profunda (8h)
Incluye todo lo de la General + 1 zona especial (1h): paredes, juntas, planchado, lavado ropa, comida o clóset.
Valor: $122.000

🧽 Limpieza General (7h)
Incluye: barrer, trapear, baños, cocina, organización del espacio, polvo, ventanas y nevera.
Valor: $107.000

🧼 Limpieza Básica (4h)
Incluye: barrer, trapear, baños, cocina y organización general.
Valor: $77.000

💡 Suscripción (opcional):
Ahorra dinero con planes mensuales desde 4 limpiezas, con descuento y agendamiento automatico.

Nuestros valores son para espacios de hasta 120 m²
✅ Antecedentes verificados
⭐️ Calificación promedio: 4.8/5
🏠 Más de 5.000 hogares felices en Medellín, Bogotá, Cali, Cartagena, Barranquilla, Bucaramanga y Pereira

¿Cual de nuestros servicios te gastaría agendar? ✨`,

  // LIMPIEZA OFICINAS
  LIMPIEZA_OFICINAS: `¡Hola! 👋 Bienvenido/a a OMMEO Empresas 🧡
Somos un marketplace de servicios profesionales y ponemos a tu disposición nuestros planes de limpieza para oficinas:

🏢 Limpieza Operativa (4h)
Ideal para mantenimiento diario.
Incluye: vaciado de papeleras, limpieza de puestos de trabajo, baños, cocina/cafetería, barrer y trapear.
Valor: $77.000

🧼 Limpieza Integral (6–7h)
Recomendada para mantener el espacio en óptimas condiciones semanalmente.
Incluye: puestos de trabajo, baños, cocina, zonas comunes, polvo, ventanas internas y desinfección de alto tráfico.
Valor: $107.000

💎 Limpieza Profunda Corporativa (8h)
Perfecta para oficinas que necesitan una restauración más completa.
Incluye todo lo de la Integral + 1 zona especial (1h): vidrios exteriores accesibles, paredes, juntas, organización de archivo, limpieza de muebles o equipos externos.
Valor: $122.000

✨ Limpieza Full Office (9h)
Incluye todo lo de la Integral + 2 zonas especiales (o 2h en una sola): paredes, juntas, organización, archivo, muebles, cocina a profundidad o desinfección especializada.
Valor: $137.000

👩‍💼 Proveedoras de Tiempo Completo
Para empresas que requieren acompañamiento diario o permanente.
Incluye: asignación de una proveedora fija, gestión y soporte desde OMMEO, reemplazos garantizados en caso de ausencia, y adaptación de tareas según las necesidades del equipo.
Valor según jornada y frecuencia.

💡 Planes Empresariales (opcional):
Optimiza tu operación con suscripciones mensuales desde 4 visitas al mes, tarifas preferenciales y agendamiento automático.

📏 Valores aplican para oficinas de hasta 120 m²
🔒 Personal con antecedentes verificados
⭐️ Calificación promedio: 4.8/5
🏢 🏠 Más de 5.000 hogares felices en Medellín, Bogotá, Cali, Cartagena, Barranquilla, Bucaramanga y Pereira
⚡ Gestión confiable, profesional y 100% a través de OMMEO

¿Deseas programar tu servicio corporativo o recibir una cotización para proveedoras de tiempo completo? ✨`,

  // UÑAS - Bienvenida (SIN PRECIOS)
  UNAS: `¡Bienvenida a OMMEO! 💅🏼, hablas con Miguel y te estaré atendiendo el día de hoy.

Ofrecemos una amplia gama de servicios para tus uñas:
- Semipermanente
- Press On
- Acrílicas
- Poligel
- Forrado

Cuéntame qué servicio deseas y tu ubicación para continuar 🧡`,

  // MASCOTAS - Preguntar raza primero
  MASCOTAS: `¡Por supuesto! 🐾 En OMMEO ofrecemos los siguientes servicios de peluquería para mascotas:
- Baño, secado, corte de pelo, corte de uñas y limpieza de oídos 🛁
- Desparacitación 💊
- Profilaxis sin anestesia

¿Cuál es la raza de tu mascota, así te puedo dar información sobre el valor del servicio? 🧡`,

  // BARBERÍA
  BARBERIA: `¡Perfecto! ✂️ Para el servicio de corte y barba, el costo va desde los $35.000 COP ¡con el domicilio ya incluído!

Para darte un precio exacto, por favor indícame:
1️⃣ Ciudad y dirección
2️⃣ Fecha y hora del servicio

Con gusto te ayudo 😊`,

  // SUSCRIPCIONES
  SUSCRIPCIONES: `Con nuestras suscripciones de limpieza OMMEO 😊, tu casa se mantiene impecable siempre y además disfrutas de beneficios exclusivos que solo nuestros suscriptores tienen.
Aquí tienes las opciones diseñadas para tu tranquilidad ✨:

🧼 Limpieza Básica – 4 servicios al mes
* Precio normal: $315,600
* Precio suscripción (8% OFF): $290,350 ✨

🧼 Limpieza Básica – 8 servicios al mes
* Precio normal: $631,200
* Precio suscripción (8% OFF): $580,700 ✨

🧽 Limpieza General – 4 servicios al mes
* Precio normal: $435,600
* Precio suscripción (8% OFF): $400,750 ✨

🧽 Limpieza General – 8 servicios al mes
* Precio normal: $871,200
* Precio suscripción (8% OFF): $801,500 ✨

💎 Limpieza Profunda – 4 servicios al mes
* Precio normal: $495,600
* Precio suscripción (8% OFF): $455,950 ✨

💎 Limpieza Profunda – 8 servicios al mes
* Precio normal: $991,200
* Precio suscripción (8% OFF): $911,900 ✨

🌟 Limpieza Full – 4 servicios al mes
* Precio normal: $555,600
* Precio suscripción (8% OFF): $511,150 ✨

🌟 Limpieza Full – 8 servicios al mes
* Precio normal: $1,111,200
* Precio suscripción (8% OFF): $1,022,300 ✨

¿Por qué elegir una suscripción OMMEO? 🧡
* 🏠 Tu proveedora favorita siempre: Disfruta de la confianza de tener siempre a la misma persona en tu hogar.
* 🛡️ Seguridad social al día: Nosotros nos encargamos de que todos los pagos legales estén siempre cubiertos.
* 📅 Agendamiento automático: Olvídate de programar cada semana; nosotros reservamos tus espacios por ti.
* ⭐ Prioridad en la agenda: Cupos garantizados incluso en las temporadas más ocupadas del año.

¿Quieres elegir tu plan de suscripción y empezar a disfrutar de una casa siempre perfecta? ✨🧡`,

  // PROVEEDORES - Quieren trabajar
  TRABAJO: `¡Hola! 👋 Gracias por tu interés en trabajar con nosotros.
Gracias por tu interés en trabajar con nosotros. 😊 Te explico un poco más sobre OMMEO:

OMMEO es una app de servicios a domicilio donde cada proveedor maneja su tiempo y nosotros nos encargamos de conseguirte los clientes. Tú solo te enfocas en brindar un buen servicio, ser responsable y ganar dinero.

🔹 Metodología de pagos:
El pago se realiza el mismo día al finalizar el servicio, directamente al número de cuenta que nos proporciones.

Estos son los valores actuales que se te pagarían por cada servicio:

Limpieza full (9 horas): $108.250

Limpieza profunda (8 horas): $95.500

Limpieza general (7 horas): $82.750

Limpieza básica (4 horas): $57.250

✨ Con OMMEO tú decides tu tiempo, nosotros ponemos los clientes, y juntos crecemos.

🔹 Cómo registrarte:
Descarga nuestra app OMMEO PROVEEDOR en App Store o Play Store.
En la parte inferior encontrarás el botón "Registrarte como proveedor". Completa tus datos y, al finalizar, nos escribes para validar tu perfil.

¿Ya te registraste? 😊`,

  // Registro de proveedores
  REGISTRO_PROVEEDOR: `Para registrarte solo debes descargar nuestra app OMMEO PROVEEDOR, cuando la abras verás en la parte de abajo el botón de registrarte, completas los datos y una vez finalizado nos escribes para validar tu perfil`,

  // Ya se registró
  YA_REGISTRADO: `Si ya te registraste, ahora debes de esperar a que nuestro equipo de registro validé tu perfil y nosotros nos estaremos comunicando contigo, el proceso de validacion puede tardar hasta 7 dias habiles`,

  // Comprobante de pago
  COMPROBANTE_PAGO: `Muchas gracias por tu pago, a la orden en lo que te podamos servir.
Tu opinión es muy importante para nosotros. ¿Nos ayudas respondiendo esta breve encuesta? 👉 https://goo.su/yTNmpy3
¡Gracias por ser parte de esta comunidad! 🧡`,

  // Reagendamiento
  REAGENDAR: `Hola, con todo el gusto 😊
¿Para cuándo deseas reagendar el servicio?
¿En caso de que esta proveedora no pueda, sería posible agendarte con otra proveedora excelentemente calificada?`,

  // Cancelación
  CANCELAR_PREGUNTA: `Hola 😊 Entendemos que puede surgir un inconveniente. ¿Sería posible reagendar el servicio?`,
  
  CANCELAR_CONFIRMADO: `Entendido 🙏 Procederé a contactar a un asesor para confirmar la cancelación.
Nuestro horario de atención es de 8:00 a.m. a 7:00 p.m. 🧡`,

  // Seguridad social
  SEGURIDAD_SOCIAL: `¡Gracias por tu interés! Te contamos cómo funciona OMMEO:

OMMEO es una plataforma de contacto de servicios que conecta a los clientes con proveedoras independientes de limpieza. Es decir, no son empleadas de OMMEO. Cada proveedora trabaja de manera autónoma, administra sus propios horarios y cubre sus responsabilidades como independiente.

Nuestra labor como plataforma es:

Verificar que cada proveedora cumpla con los requisitos legales para trabajar como independiente, incluyendo tener su seguridad social al día.

Garantizar que sean confiables, capacitadas y aptas para prestar un excelente servicio.

Actuar únicamente como un portal de contacto entre clientes y proveedoras.

En cuanto a la seguridad social y uniformes:

Las proveedoras son responsables de cubrir su propia seguridad social (EPS, ARL y pensión), tal como exige la ley para trabajadores independientes.

OMMEO no cubre uniformes, pero cada proveedora sí cuenta con su propio uniforme y mantiene una presentación adecuada y profesional.

Nuestro objetivo es ofrecerte un servicio seguro, confiable y de calidad, conectándote con proveedoras responsables y verificadas.`,

  // Fotos recibidas
  FOTO_RECIBIDA: `¡Gracias por la foto! 📸 Le enviaremos la imagen a nuestro proveedor para obtener el precio del servicio que deseas.`,

  // Queja
  QUEJA: `Lamentamos lo ocurrido 🙏
Cuéntanos por favor qué sucedió para poder ayudarte.
Todos nuestros servicios cuentan con garantía y queremos darte una solución 🧡`,

  // Felicitación
  FELICITACION: `¡Nos alegra muchísimo saberlo! 😊
Gracias por confiar en OMMEO 🧡
Tu calificación nos ayuda a seguir creciendo.`,

  // Confirmación de booking
  CONFIRMANDO_DISPONIBILIDAD: `Estamos confirmando la disponibilidad del proveedor en tu dirección y fecha. Un agente te confirmará en breve 🧡`,

  // Mensaje de handoff para uñas
  HANDOFF_UNAS_PRECIO: `🧡 Para darte el precio exacto de tu servicio de uñas, te paso con una asesora que te cotizará en segundos.`,
  
  HANDOFF_UNAS_FOTOS: `🧡 Claro que sí, te contactaré con un agente para que así podamos enviarte de manera personalizada, referentes en imagen del trabajo de nuestro proveedor o proveedora.`
};

// ============================================
// CATÁLOGO DE SERVICIOS CON PRECIOS
// ============================================
const SERVICES = {
  limpieza: {
    basica: { name: 'Limpieza Básica', duration: '4h', price: 77000 },
    general: { name: 'Limpieza General', duration: '7h', price: 107000 },
    profunda: { name: 'Limpieza Profunda', duration: '8h', price: 122000 },
    full: { name: 'Limpieza Full', duration: '9h', price: 137000 }
  },
  adicionales: {
    lavado_ropa: { name: 'Lavado de ropa', price: 15000, unit: 'hora' },
    planchado: { name: 'Planchado de ropa', price: 15000, unit: 'hora' },
    comida: { name: 'Preparación de comida', price: 15000, unit: 'hora' },
    paredes: { name: 'Limpieza de paredes', price: 15000, unit: 'hora' },
    juntas: { name: 'Limpieza de juntas', price: 15000, unit: 'hora' },
    closet: { name: 'Organización closet', price: 15000, unit: 'hora' }
  },
  mascotas: {
    bano_corte: { name: 'Baño y corte de mascotas', priceFrom: 50000, note: 'Desde, confirmar según raza' }
  },
  barberia: {
    corte: { name: 'Corte de cabello hombre', priceFrom: 35000, note: 'Incluye domicilio' }
  },
  otros: {
    fumigacion: { name: 'Fumigación', priceFrom: 130000 }
  }
};

// ============================================
// FAQ - PREGUNTAS FRECUENTES
// ============================================
const FAQ = {
  // Productos
  productos_incluidos: {
    triggers: ['productos', 'insumos', 'llevan', 'traen'],
    answer: 'No, debido a que todos los clientes tienen gustos diferentes, siempre el servicio se hace con los productos del cliente. Pero no te preocupes, no se requiere nada fuera de lo normal: solo los implementos habituales de aseo. 🧼🙂'
  },
  
  lista_productos: {
    triggers: ['lista de productos', 'qué productos', 'qué necesito'],
    answer: `Implementos limpieza:
- Trapos secos y trapos húmedos (microfibra preferiblemente)
- Trapero y balde
- Escoba y recogedor
- Esponjas suaves y fibra verde
- Limpia vidrios o paño especial para cristales
- Cepillo de mano o escobilla pequeña
- Jabón líquido o detergente multiusos
- Limpiador de baños o antisarro
- Limpiador de cocina/desengrasante
- Frotex para paredes (si aplica)
- Guantes de caucho
- Toallas absorbentes o papel de cocina (opcional)`
  },

  // Pagos
  metodos_pago: {
    triggers: ['cómo pago', 'formas de pago', 'métodos de pago', 'puedo pagar'],
    answer: `Puedes pagar durante el servicio con:
✅ Efectivo
✅ Tarjeta débito o crédito
✅ PSE o transferencia bancaria

El pago se realiza antes de que la proveedora se retire 😊`
  },

  cuando_pago: {
    triggers: ['cuándo pago', 'momento del pago', 'anticipo'],
    answer: 'El pago se realiza durante el servicio, antes de que la proveedora se retire. Por favor enviar comprobante de pago por este medio.'
  },

  pago_efectivo: {
    triggers: ['efectivo', 'cash'],
    answer: 'Sí recibimos pagos en efectivo. El cliente paga al proveedor en el transcurso del servicio el precio total + el valor del servicio OMMEO $1.900, y el proveedor nos paga a nosotros.'
  },

  link_pago: {
    triggers: ['link de pago', 'wompi', 'tarjeta de crédito'],
    answer: 'Link de pago Wompi: https://checkout.wompi.co/l/VPOS_a0G6J5'
  },

  cuenta_bancolombia: {
    triggers: ['cuenta bancolombia', 'número de cuenta', 'transferencia'],
    answer: `Cuenta Corriente Bancolombia:
00400002731
OMMEO SAS
NIT 901616970`
  },

  // Cobertura
  zonas: {
    triggers: ['zonas', 'ciudades', 'cobertura', 'dónde'],
    answer: `Prestamos servicio en:
📍 Bogotá
📍 Medellín
📍 Cali
📍 Barranquilla
📍 Cartagena
📍 Bucaramanga
📍 Pereira`
  },

  // Sobre OMMEO
  que_es_ommeo: {
    triggers: ['qué es ommeo', 'quiénes son', 'descripción'],
    answer: `Somos la comunidad más grande de profesionales y oportunidades laborales en Colombia. Nos especializamos en conectar a especialistas altamente capacitados con personas que buscan soluciones efectivas para sus necesidades específicas.

Creemos en el sentido de comunidad evolutiva, en la independencia laboral y financiera, y en la búsqueda constante de una mejor calidad de vida.

Conoce más aquí: https://ommeo.org`
  },

  quien_eres: {
    triggers: ['quién eres', 'eres un bot', 'eres humano'],
    answer: 'Soy Miguel y soy una combinación entre el poder de una máquina y las habilidades de un humano, soy tu agente especial y estoy para ayudarte en cualquier momento, ¿Cómo deseas que te ayude hoy?'
  },

  // Servicios
  que_servicios: {
    triggers: ['qué servicios', 'más servicios', 'qué más tienen'],
    answer: 'Actualmente contamos con servicios de limpieza, arreglo de uñas y peluquería de mascotas'
  },

  domicilio: {
    triggers: ['vienen hasta acá', 'a domicilio', 'hay que ir'],
    answer: 'Todos nuestros servicios son a domicilio'
  },

  garantia: {
    triggers: ['garantía', 'garantia'],
    answer: 'Sí, todos nuestros servicios cuentan con garantía'
  },

  // Proveedoras
  misma_proveedora: {
    triggers: ['misma proveedora', 'la misma persona'],
    answer: 'Si es posible pero es a disponibilidad, puedes hacerlo con anticipación o adquirir una suscripción a OMMEO donde se te agenda siempre a la misma proveedora'
  },

  proveedora_mujer: {
    triggers: ['proveedora mujer', 'mujer'],
    answer: 'Claro que sí, con gusto te enviaremos una proveedora OMMEO'
  },

  proveedor_hombre: {
    triggers: ['proveedor hombre', 'hombre'],
    answer: 'Claro que sí, con gusto te enviaremos un proveedor OMMEO'
  },

  uniforme: {
    triggers: ['uniforme', 'presentación'],
    answer: 'Con todo el gusto podemos agendarte con una proveedora con uniforme'
  },

  alimentacion: {
    triggers: ['alimentación', 'comida proveedora', 'almuerzo'],
    answer: 'Las proveedoras llevan su alimentación si así lo deseas.'
  },

  cocinan: {
    triggers: ['cocinan', 'preparar comida'],
    answer: 'Si es para un solo día - $15.000 y si es para una semana $25.000 el día'
  },

  // Suscripciones
  que_es_suscripcion: {
    triggers: ['qué es una suscripción', 'cómo funciona la suscripción'],
    answer: 'La suscripción es un plan donde eliges cuántos servicios quieres al mes (por ejemplo 4 u 8 limpiezas). Pagas un valor mensual con descuento frente al precio normal, y tus servicios quedan agendados automáticamente para que no tengas que pedirlos uno por uno. Además, tienes prioridad en la asignación de proveedoras, pagos a seguridad social cubiertos y puedes tener a la misma proveedora en cada servicio.'
  },

  necesito_suscripcion: {
    triggers: ['tengo que comprar suscripción', 'obligatorio suscripción'],
    answer: 'No 🙂 La suscripción es para quienes quieren varios servicios al mes con descuento. Igual puedes solicitar un servicio individual sin inconvenientes.'
  },

  // Comisiones
  comision_proveedor: {
    triggers: ['comisión', 'cuánto restan', 'porcentaje'],
    answer: 'Al proveedor le recaudamos una tarifa del 15% por cada servicio que realiza con nosotros'
  },

  tarifa_cliente: {
    triggers: ['cuánto cobra la plataforma', 'tarifa conexión'],
    answer: 'Cobramos una tarifa por conexión de $1.900 COP pesos colombianos'
  },

  // App
  descargar_app: {
    triggers: ['descargar app', 'app', 'aplicación'],
    answer: `Descarga nuestra app OMMEO, y encuentra servicios de limpieza, arreglo de uñas y peluquería de mascotas. Ofrecemos garantía en todos nuestros servicios.
¡Descarga OMMEO ahora y disfruta de una experiencia cómoda y segura!
https://linktr.ee/ommeocolombia`
  },

  // Número de proveedor
  numero_proveedor: {
    triggers: ['número de la proveedora', 'teléfono proveedor', 'contacto proveedor'],
    answer: 'No podemos pasar información personal de nuestros proveedores incluido su número de teléfono, pero con gusto te prestamos una atención inmediata para lo que necesites.'
  },

  // A quién pago
  a_quien_pago: {
    triggers: ['a quién pago', 'a quien le pago'],
    answer: 'El pago nos lo haces a nosotros y nosotros le pagamos a la proveedora'
  },

  quien_me_paga: {
    triggers: ['quién me paga', 'cómo me pagan'],
    answer: 'El cliente nos paga a nosotros y nosotros te pagamos a ti como proveedora al final del servicio'
  },

  // Horarios
  horarios: {
    triggers: ['horarios', 'hora más temprana', 'desde qué hora'],
    answer: 'Los horarios son muy flexibles. La hora más temprana para inicio de los servicios es de lunes a sábado 8:00 a.m. y domingos 9:00 a.m.'
  },

  // Horario atención
  horario_atencion: {
    triggers: ['horario de atención', 'hasta qué hora atienden'],
    answer: 'Nuestro horario de atención al cliente es de 8:00 a.m. a 7:00 p.m.'
  },

  // Limpieza profunda detalles
  limpieza_profunda_detalles: {
    triggers: ['limpieza profunda incluye', 'qué incluye profunda'],
    answer: `Para la limpieza profunda, además de las tareas de aseo general, puedes escoger una de las siguientes tareas (1 hora de servicio):
- Limpieza de juntas
- Limpieza de paredes
- Preparación de alimentos
- Planchado de ropa
- Lavado de ropa
- Organización closet

¿Cuál de estas tareas te gustaría para tu servicio?`
  }
};

// ============================================
// POLÍTICAS DE NEGOCIO
// ============================================
const POLICIES = {
  coverage: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Oriente Antioqueño'],
  payment_methods: ['Efectivo', 'Tarjeta débito', 'Tarjeta crédito', 'PSE', 'Transferencia bancaria', 'Nequi', 'Bancolombia'],
  payment_timing: 'Durante el servicio, antes de que la proveedora se retire',
  max_area: '120 m²',
  platform_fee: 1900,
  provider_commission: 0.15,
  business_hours: {
    weekdays: { start: '8:00', end: '19:00' },
    sunday: { start: '9:00', end: '19:00' }
  },
  contact: {
    phone: '+573245777323',
    email: 'contacto@ommeo.org',
    website: 'https://ommeo.org'
  }
};

// ============================================
// PATRONES DE INTENCIÓN (REGEX)
// ============================================
const INTENT_PATTERNS = {
  // Limpieza
  LIMPIEZA: /limpi(eza|ar|o)|aseo|hogar|casa|apartamento|servicio.*casa/i,
  LIMPIEZA_OFICINA: /oficina|empresa|corporativ|comercial/i,
  
  // Subtipos limpieza
  LIMPIEZA_BASICA: /b[aá]sica|4\s*h(ora)?s?/i,
  LIMPIEZA_GENERAL: /general|7\s*h(ora)?s?/i,
  LIMPIEZA_PROFUNDA: /profunda|8\s*h(ora)?s?/i,
  LIMPIEZA_FULL: /full|completa|9\s*h(ora)?s?/i,
  
  // Uñas
  UNAS: /u[ñn]a|manicur|pedicur|acr[ií]l|semipermanente|press\s*on|poligel|forrado/i,
  
  // Mascotas
  MASCOTAS: /mascot|perr|gat|pet|peluquer[ií]a.*mascot|ba[ñn]o.*mascot/i,
  
  // Barbería
  BARBERIA: /barb|cort.*pelo|cort.*cabello|afeit/i,
  
  // Suscripciones
  SUSCRIPCION: /suscripci[oó]n|plan mensual|mensual|frecuente/i,
  
  // Trabajo/Proveedor
  TRABAJO: /trabaj|empleo|vacante|quiero trabajar|busco trabajo|soy proveedor|ofrec.*servicio/i,
  REGISTRO_PROVEEDOR: /registr|ya me registr[eé]|no.*deja.*iniciar/i,
  
  // Reagendar/Cancelar
  REAGENDAR: /reagend|cambiar.*fecha|otra.*fecha/i,
  CANCELAR: /cancel|no quiero|ya no/i,
  
  // Pagos
  COMPROBANTE: /comprobante|pago realizado|ya pagu[eé]|soporte.*pago/i,
  
  // Quejas/Feedback
  QUEJA: /queja|reclamo|mal servicio|no.*gust[oó]/i,
  FELICITACION: /excelente|muy bueno|felicit|me gust[oó]|incre[ií]ble/i,
  
  // Handoff explícito
  HANDOFF_EXPLICITO: /hablar.*(?:persona|humano|agente|asesora?)|ayuda real|alguien real|p[aá]same con/i,
  
  // Fotos/Portafolio (solo para uñas)
  FOTOS: /foto|portafolio|ejemplo|muestra|referent|imagen/i,
  
  // Precios uñas (handoff)
  PRECIO_UNAS: /(?:cu[aá]nto|precio|valor|cuesta).*(?:u[ñn]a|manicur|pedicur)/i,
  
  // Saludos
  SALUDO: /^(hola|buenos?\s*d[ií]as?|buenas?\s*tardes?|buenas?\s*noches?|hey|hi)[\s!?.,]*$/i
};

// ============================================
// FLUJOS DE CONVERSACIÓN
// ============================================
const FLOWS = {
  limpieza: {
    order: ['service_subtype', 'date_time', 'address', 'payment_method'],
    questions: {
      ASK_SERVICE_TYPE: "¿Cuál de nuestros servicios te gustaría agendar? ✨",
      date_time: '¿Para qué fecha y hora necesitas el servicio? 📅',
      address: 'Perfecto, ¿cuál es la dirección completa del servicio? (Ciudad, barrio, dirección, nombre del edificio y número de apartamento)',
      payment_method: `¿Qué método de pago prefieres? Tenemos disponibles:
✅ Tarjeta débito o crédito
✅ Transferencia bancaria
✅ PSE o Transferencia virtual
✅ Efectivo`
    }
  },
  mascotas: {
    order: ['pet_breed', 'location', 'date_time'],
    questions: {
      pet_breed: '¿Cuál es la raza de tu mascota? 🐾',
      location: '¿En qué ciudad y dirección te encuentras?',
      date_time: '¿Para qué fecha y hora necesitas el servicio?'
    }
  },
  unas: {
    order: ['service_type', 'location', 'date_time'],
    questions: {
      service_type: '¿Qué servicio te interesa y cuál es la ubicación?',
      location: '¿En qué ciudad y dirección te encuentras?',
      date_time: '¿Para qué fecha y hora lo necesitas?'
    },
    handoff_on_price: true
  },
  barberia: {
    order: ['location', 'date_time'],
    questions: {
      location: '¿En qué ciudad y dirección necesitas el servicio?',
      date_time: '¿Para qué fecha y hora lo necesitas?'
    }
  }
};

module.exports = {
  EXACT_RESPONSES,
  SERVICES,
  FAQ,
  POLICIES,
  INTENT_PATTERNS,
  FLOWS
};
