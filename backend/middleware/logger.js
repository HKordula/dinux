const logger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, body, query } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${method} ${originalUrl} ${res.statusCode} (${duration}ms)`
    );
    if (Object.keys(query).length) {
      console.log('  Query:', query);
    }
    if (Object.keys(body).length) {
      console.log('  Body:', body);
    }
  });

  next();
};

export default logger;