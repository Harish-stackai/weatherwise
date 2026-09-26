const ApiLog = require('../models/ApiLog');

const apiLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    // Only log API routes to avoid clutter
    if (req.originalUrl && req.originalUrl.startsWith('/api')) {
      const responseTimeMs = Date.now() - start;
      const cityQueried = (req.query && req.query.city) || (req.body && req.body.city) || '';
      const isFallback = (res.locals && res.locals.isFallback) || false;

      ApiLog.create({
        endpoint: req.originalUrl.split('?')[0],
        method: req.method,
        statusCode: res.statusCode,
        responseTimeMs,
        user: req.user ? req.user._id : null,
        ip: req.ip || req.headers['x-forwarded-for'] || '',
        cityQueried,
        isFallback,
      }).catch((err) => {
        // Silently catch logging errors to avoid disrupting user response
      });
    }
  });

  next();
};

module.exports = { apiLogger };
