import mongoose from "mongoose";
import log from "../utils/logger.util.js";
import config from "./env.config.js";

export const dbConnection = async () => {
  try {
    await mongoose.connect(config.db.mongodbUri);
    log.info("Database connected successfully.");
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`);
    throw error;
  }
};
