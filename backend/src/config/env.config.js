import dotenv from "dotenv";
dotenv.config();

const config = {
  app: {
    env: process.env.NODE_ENV || "development",
    port: process.env.APP_PORT || 8080,
    host: process.env.APP_HOST || "localhost",
  },
  db: {
    mongodbUri: process.env.MONGODB_URI,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || "secret",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
  },
  cloudinary: {
    name: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_CLOUD_KEY,
    secret: process.env.CLOUDINARY_CLOUD_SECRET,
  },
};

export default config;
