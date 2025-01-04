import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import { decodeToken } from "../utils/jwt.util.js";

export const validateUserToken = async (req, res, next) => {
  const { access_token } = req.cookies;

  try {
    if (!access_token) throw new AppError("Access token not provided", 401);

    const userId = decodeToken(access_token);

    const user = await User.findById(userId).select("-password");
    if (!user) throw new AppError("User not found", 404);

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
