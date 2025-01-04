import express from "express";
import {
  checkAuth,
  login,
  logout,
  refresh,
  signup,
  updateFullname,
  updateProfile,
} from "../controllers/auth.controller.js";
import { validateUserToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh", refresh);

router.put("/update-profile/:id", validateUserToken, updateProfile);

router.put("/update-fullname/:id", validateUserToken, updateFullname);

router.get("/check", validateUserToken, checkAuth);

export default router;
