import express from "express";
import { validateUserToken } from "../middleware/auth.middleware.js";
import {
  getMessage,
  getUserForSitebar,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", validateUserToken, getUserForSitebar);
router.get("/:id", validateUserToken, getMessage);
router.post("/send/:id", validateUserToken, sendMessage);

export default router;
