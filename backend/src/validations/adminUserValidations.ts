import z from "zod";

const genderEnum = z.enum(["Male", "Female", "Other"]);

const baseFields = {
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(120),
  gender: genderEnum.optional(),
  phoneNumber: z.string().max(40).optional().nullable(),
};

export const AdminCreateTeacherSchema = z.object({
  ...baseFields,
  specialization: z.string().max(120).optional().nullable(),
});

export const AdminCreateStudentSchema = z.object({
  ...baseFields,
  enrolledYearGroupId: z.coerce.number().int().positive(),
});

export type AdminCreateTeacherInput = z.infer<typeof AdminCreateTeacherSchema>;
export type AdminCreateStudentInput = z.infer<typeof AdminCreateStudentSchema>;

export const AdminUpdateStatusSchema = z.object({
  status: z.enum(["Active", "Inactive", "Suspended"]),
});

export const AdminUpdateTeacherSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  gender: genderEnum.optional(),
  phoneNumber: z.string().max(40).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  specialization: z.string().max(120).optional().nullable(),
});

export const AdminUpdateStudentSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  gender: genderEnum.optional(),
  phoneNumber: z.string().max(40).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  enrolledYearGroupId: z.coerce.number().int().positive().nullable(),
});

export type AdminUpdateTeacherInput = z.infer<typeof AdminUpdateTeacherSchema>;
export type AdminUpdateStudentInput = z.infer<typeof AdminUpdateStudentSchema>;
