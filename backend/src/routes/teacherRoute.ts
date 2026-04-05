import express from "express";
import { GetTeacherClasses, SubmitGrades, SubmitAttendance } from "../controllers/teacherController.js";
import { AuthenticateRequest } from "../middleware/authenticate.js";

const router = express.Router();

// Fetch Year Group mapping for teacher
router.get("/classes", AuthenticateRequest, GetTeacherClasses);

// Mutating endpoints for Teachers
router.post("/grades", AuthenticateRequest, SubmitGrades);
router.post("/attendance", AuthenticateRequest, SubmitAttendance);

export default router;
