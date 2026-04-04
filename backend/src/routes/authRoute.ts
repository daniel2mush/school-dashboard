import express from "express";
import {
  GenerateRefreshToken,
  Login,
  Logout,
  Register,
} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.post("/logout", Logout);
router.post("/refresh-token", GenerateRefreshToken);

export default router;
