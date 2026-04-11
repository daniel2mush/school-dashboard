import express from "express";
import {
  GetUserProfile,
  GetAnnouncements,
  DownloadStudentMaterial,
  GetStudentMaterials,
  GetSchoolSettings,
} from "../controllers/userController.js";
import { AuthenticateRequest } from "../middleware/authenticate.js";
import {Logout} from "../controllers/authControllers.js";

const router = express.Router();

router.get("/announcements", AuthenticateRequest, GetAnnouncements);
router.get("/materials", AuthenticateRequest, GetStudentMaterials);
router.get("/materials/:id/download", AuthenticateRequest, DownloadStudentMaterial);
router.get("/school-settings", AuthenticateRequest, GetSchoolSettings);
router.get("/:id", AuthenticateRequest, GetUserProfile);

export default router;
