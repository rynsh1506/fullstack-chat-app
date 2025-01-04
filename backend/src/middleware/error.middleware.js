import log from "../utils/logger.util.js";
import config from "../config/env.config.js";

const errorMiddleware = (err, req, res, next) => {
  log.error(`Error: ${err.message}`);

  if (config.ENV === "development") {
    return res.status(err.statusCode || 500).json({
      code: err.statusCode,
      status: "error",
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(err.statusCode || 500).json({
    code: err.statusCode,
    status: "error",
    message: err.isOperational
      ? err.message
      : "Something went wrong. Please try again later.",
  });
};

export default errorMiddleware;
