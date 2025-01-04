import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import {
  decodeToken,
  generateRefreshToken,
  generateToken,
  sendTokenToCookie,
} from "../utils/jwt.util.js";
import {
  emailValidation,
  fullnameValidation,
  passwordValidation,
} from "../utils/validation.util.js";
import RefreshToken from "../models/refreshToken.model.js";
import cloudinary from "../utils/cloudinary.util.js";

export const signup = async (req, res, next) => {
  const { email, fullname, password } = req.body;

  try {
    emailValidation(email);
    fullnameValidation(fullname);
    passwordValidation(password);

    const userExists = await User.findOne({ email });

    if (userExists) throw new AppError("Email already exists", 409);

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = await User.create({
      email,
      fullname,
      password: hashedPassword,
    });

    if (!newUser) throw new AppError("Invalid user data", 400);

    const newAccessToken = generateToken(newUser._id);
    const newRefreshToken = generateRefreshToken(newUser._id);

    sendTokenToCookie(res, newAccessToken, "access_token", {
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    sendTokenToCookie(res, newRefreshToken, "refresh_token", {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await createRefreshToken(newUser._id, newRefreshToken);

    const response = {
      code: 201,
      message: "User created successfuly.",
      data: {
        _id: newUser._id,
        email: newUser.email,
        fullname: newUser.fullname,
        profile_pic: newUser.profile_pic,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    };

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const { access_token } = req.cookies;
  try {
    if (access_token) throw new AppError("You are already logged in", 400);

    const user = await User.findOne({ email });

    if (!user) throw new AppError("User not found", 404);

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) throw new AppError("Invalid password", 401);

    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    sendTokenToCookie(res, newAccessToken, "access_token", {
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    sendTokenToCookie(res, newRefreshToken, "refresh_token", {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await createRefreshToken(user._id, newRefreshToken);

    const response = {
      code: 200,
      message: "Logged in successfuly",
      data: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        profile_pic: user.profile_pic,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  const { refresh_token, access_token } = req.cookies;

  try {
    if (!refresh_token && !access_token)
      throw new AppError("Token not provided", 401);

    const userId = decodeToken(refresh_token, false);

    const storedToken = await RefreshToken.deleteOne({
      userId,
      token: refresh_token,
    });

    if (!storedToken) throw new AppError("Invalid refresh token", 403);

    res.cookie("access_token", "", { maxAge: 0 });
    res.cookie("refresh_token", "", { maxAge: 0 });

    const response = {
      code: 200,
      message: "Logged out successfuly",
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  const { refresh_token } = req.cookies;

  try {
    if (!refresh_token) throw new AppError("Refresh Token not provided", 401);

    const userId = decodeToken(refresh_token, false);

    const storedToken = await RefreshToken.findOne({
      userId,
      token: refresh_token,
    });

    if (!storedToken) throw new AppError("Invalid refresh token", 403);

    if (storedToken.expiresAt < Date.now())
      throw new AppError("Refresh token expired", 403);

    await RefreshToken.deleteOne({ userId, token: refresh_token });

    const newAccessToken = generateToken(userId);
    const newRefreshToken = generateRefreshToken(userId);

    sendTokenToCookie(res, newAccessToken, "access_token", {
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    sendTokenToCookie(res, newRefreshToken, "refresh_token", {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await createRefreshToken(userId, newRefreshToken);

    const user = await User.findById(userId).select("-password");

    return res
      .status(200)
      .json({ code: 200, message: "Tokens rotated successfully", data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  const { id } = req.params;
  const { profile_pic } = req.body;
  try {
    const userId = req.user._id;

    if (id !== userId.toString()) {
      throw new AppError("You cannot update this profile", 403);
    }

    if (!profile_pic) throw new AppError("Profile Pic not provided", 400);

    const uploadResponse = await cloudinary.uploader.upload(profile_pic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profile_pic: uploadResponse.secure_url,
      },
      { new: true }
    ).select("-password");

    const response = {
      code: 200,
      message: "Profile Pic updated successfuly",
      data: updatedUser,
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateFullname = async (req, res, next) => {
  const { id } = req.params;
  const { fullname } = req.body;
  try {
    const userId = req.user._id;

    if (id !== userId.toString()) {
      throw new AppError("You cannot update this profile", 403);
    }

    fullnameValidation(fullname);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullname,
      },
      { new: true }
    ).select("-password");

    const response = {
      code: 200,
      message: "Fullname updated successfuly",
      data: updatedUser,
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const checkAuth = (req, res, next) => {
  try {
    const response = {
      data: req.user,
    };
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const createRefreshToken = async (userId, token) => {
  const refreshToken = new RefreshToken({
    userId,
    token,
  });

  await refreshToken.save();
};
