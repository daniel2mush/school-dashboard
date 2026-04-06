import express from "express";
import {
  GetAdminAnalytics,
  GetAllUsers,
  GetSchoolStructure,
  CreateAnnouncement,
  CreateYearGroup,
  UpdateYearGroup,
  AssignTeacherToYearGroup,
  UnassignTeacherFromYearGroup,
  MoveStudentYearGroup,
  AdminCreateUser,
  AdminUpdateUser,
  AdminUpdateUserStatus,
  AdminResetUserPassword,
  AdminDeleteUser,
  CreateSubject,
  AssignSubjectToYearGroup,
  UnassignSubjectFromYearGroup,
  UpdateSubject,
  DeleteSubject,
  GetAllSubjects,
  CreateFee,
  GetFeesByYearGroup,
  UpdateFee,
  DeleteFee,
  GetFeeManagementOverview,
  UpsertFeePayment,
} from "../controllers/adminController.js";
import { AuthenticateRequest } from "../middleware/authenticate.js";

const router = express.Router();

// Fetch admin specific endpoints
router.get("/analytics", AuthenticateRequest, GetAdminAnalytics);
router.get("/users", AuthenticateRequest, GetAllUsers);
router.post("/users", AuthenticateRequest, AdminCreateUser);
router.patch("/users/:id", AuthenticateRequest, AdminUpdateUser);
router.patch("/users/:id/status", AuthenticateRequest, AdminUpdateUserStatus);
router.delete("/users/:id", AuthenticateRequest, AdminDeleteUser);
router.post(
  "/users/:id/reset-password",
  AuthenticateRequest,
  AdminResetUserPassword,
);
router.get("/structure", AuthenticateRequest, GetSchoolStructure);

// Global actions
router.post("/announcements", AuthenticateRequest, CreateAnnouncement);

// Year groups
router.post("/year-groups", AuthenticateRequest, CreateYearGroup);
router.patch("/year-groups/:id", AuthenticateRequest, UpdateYearGroup);
router.post(
  "/year-groups/assign-teacher",
  AuthenticateRequest,
  AssignTeacherToYearGroup,
);
router.post(
  "/year-groups/unassign-teacher",
  AuthenticateRequest,
  UnassignTeacherFromYearGroup,
);
router.post(
  "/year-groups/move-student",
  AuthenticateRequest,
  MoveStudentYearGroup,
);

router.get("/subjects", AuthenticateRequest, GetAllSubjects);
router.post("/subjects", AuthenticateRequest, CreateSubject);
router.patch("/subjects/:id", AuthenticateRequest, UpdateSubject);
router.delete("/subjects/:id", AuthenticateRequest, DeleteSubject);
router.post(
  "/subjects/assign-year-group",
  AuthenticateRequest,
  AssignSubjectToYearGroup,
);
router.post(
  "/subjects/unassign-year-group",
  AuthenticateRequest,
  UnassignSubjectFromYearGroup,
);

router.get("/fees", AuthenticateRequest, GetFeeManagementOverview);
router.post("/fees", AuthenticateRequest, CreateFee);
router.get("/fees/year-group/:yearGroupId", AuthenticateRequest, GetFeesByYearGroup);
router.patch("/fees/:id", AuthenticateRequest, UpdateFee);
router.delete("/fees/:id", AuthenticateRequest, DeleteFee);
router.patch(
  "/fees/:feeId/payments/:studentId",
  AuthenticateRequest,
  UpsertFeePayment,
);

export default router;
