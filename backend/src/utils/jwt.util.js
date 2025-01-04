import jwt from "jsonwebtoken";
import config from "../config/env.config.js";
import AppError from "./error.util.js";

export const generateToken = (userId, res) => {
  try {
    const token = jwt.sign({ userId }, config.security.jwtSecret, {
      expiresIn: "3d",
    });

    return token;
  } catch (error) {
    throw new AppError(error, 400);
  }
};

export const generateRefreshToken = (userId) => {
  try {
    const token = jwt.sign({ userId }, config.security.jwtRefreshSecret, {
      expiresIn: "7d",
    });

    return token;
  } catch (error) {
    throw new AppError(error, 400);
  }
};

export const sendTokenToCookie = (res, token, tokenName, options = {}) => {
  res.cookie(tokenName, token, {
    maxAge: options.maxAge || 7 * 24 * 60 * 60 * 1000,
    httpOnly: options.httpOnly !== false,
    sameSite: options.sameSite || "strict",
    secure: config.app.env !== "development",
  });
};

export const decodeToken = (token, isNotRefresh = true) => {
  const secretKey = isNotRefresh
    ? config.security.jwtSecret
    : config.security.jwtRefreshSecret;

  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.userId;
  } catch (error) {
    throw new AppError(error, 401);
  }
};
