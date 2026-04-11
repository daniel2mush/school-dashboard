import express from "express";
import {
  GetTeacherClasses,
  SubmitGrades,
  SubmitAttendance,
  GetTeacherMaterials,
  DownloadTeacherMaterial,
  UploadMaterial,
  ToggleMaterialStatus,
  DeleteMaterial,
  CreateTeacherAnnouncement,
} from "../controllers/teacherController.js";
import { AuthenticateRequest } from "../middleware/authenticate.js";
import { uploadMiddlware } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Fetch Year Group mapping for teacher
router.get("/classes", AuthenticateRequest, GetTeacherClasses);

// Materials management
router.get("/materials", AuthenticateRequest, GetTeacherMaterials);
router.get("/materials/:id/download", AuthenticateRequest, DownloadTeacherMaterial);
router.post(
  "/materials",
  AuthenticateRequest,
  uploadMiddlware.single("document"),
  UploadMaterial,
);
router.patch(
  "/materials/:id/status",
  AuthenticateRequest,
  ToggleMaterialStatus,
);
router.delete("/materials/:id", AuthenticateRequest, DeleteMaterial);

// Mutating endpoints for Teachers
router.post("/grades", AuthenticateRequest, SubmitGrades);
router.post("/attendance", AuthenticateRequest, SubmitAttendance);
router.post("/announcements", AuthenticateRequest, CreateTeacherAnnouncement);

export default router;
