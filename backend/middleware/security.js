const helmet = require('helmet');
const cors = require('cors');

// Security middleware configuration
const securityConfig = () => {
  // Helmet for security headers
  const helmetConfig = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  });

  // CORS configuration
  const corsConfig = cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://localhost:4173', // Vite preview
        process.env.FRONTEND_URL
      ].filter(Boolean);
      
      // In development, be more permissive
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
  });

  return { helmetConfig, corsConfig };
};

// Request sanitization
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

// API key validation (for future use)
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (process.env.NODE_ENV === 'production' && !apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required'
    });
  }
  
  next();
};

// Request logging for security monitoring
const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user ? req.user._id : null
    };
    
    // Log suspicious activities
    if (res.statusCode >= 400) {
      console.warn('Security Alert:', logData);
    }
    
    // Log all requests in production
    if (process.env.NODE_ENV === 'production') {
      console.log('Request:', logData);
    }
  });
  
  next();
};

module.exports = {
  securityConfig,
  sanitizeInput,
  validateApiKey,
  securityLogger
};
