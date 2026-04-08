import express from "express";
import { GetTeacherClasses, SubmitGrades, SubmitAttendance, GetTeacherMaterials, UploadMaterial, ToggleMaterialStatus, CreateTeacherAnnouncement } from "../controllers/teacherController.js";
import { AuthenticateRequest } from "../middleware/authenticate.js";

const router = express.Router();

// Fetch Year Group mapping for teacher
router.get("/classes", AuthenticateRequest, GetTeacherClasses);

// Materials management
router.get("/materials", AuthenticateRequest, GetTeacherMaterials);
router.post("/materials", AuthenticateRequest, UploadMaterial);
router.patch("/materials/:id/status", AuthenticateRequest, ToggleMaterialStatus);

// Mutating endpoints for Teachers
router.post("/grades", AuthenticateRequest, SubmitGrades);
router.post("/attendance", AuthenticateRequest, SubmitAttendance);
router.post("/announcements", AuthenticateRequest, CreateTeacherAnnouncement);

export default router;
