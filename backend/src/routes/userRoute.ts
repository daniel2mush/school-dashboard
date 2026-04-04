import express from "express";
import { GetUserProfile } from "../controllers/userController.js";
import { AuthenticateRequest } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/:id", AuthenticateRequest, GetUserProfile);

export default router;
