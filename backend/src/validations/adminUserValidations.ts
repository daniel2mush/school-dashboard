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
