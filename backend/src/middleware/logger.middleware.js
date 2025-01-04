import log from "../utils/logger.util.js";

const loggerMiddleware = (req, res, next) => {
  const method = req.method;
  const url = req.url;
  const startTime = Date.now();

  res.on("finish", () => {
    const statusCode = res.statusCode;
    const executionTime = (Date.now() - startTime).toFixed(3);

    log.info(`${method} ${url} - ${statusCode} - ${executionTime}ms`);
  });

  next();
};

export default loggerMiddleware;
