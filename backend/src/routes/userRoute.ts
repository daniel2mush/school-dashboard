import express from "express";
import { GetUserProfile, GetAnnouncements } from "../controllers/userController.js";
import { AuthenticateRequest } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/announcements", AuthenticateRequest, GetAnnouncements);
router.get("/:id", AuthenticateRequest, GetUserProfile);

export default router;
