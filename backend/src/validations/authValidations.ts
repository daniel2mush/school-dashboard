import z from "zod";

const genderEnum = z.enum({
  Male: "Male",
  Female: "Female",
  Others: "Others",
});

const RegistrationSchema = z.object({
  email: z.email(),
  password: z.string().min(4).max(8),
  name: z.string(),
  initials: z.string().optional(),
  gender: genderEnum.default("Male"),
  dateOfBirth: z.date(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().optional(),
  specialization: z.string(), // For teachers
});

export type RegistrationTypes = z.infer<typeof RegistrationSchema>;

export const ValidateRegistration = (data: any) => {
  const {
    success,
    data: validatedData,
    error,
  } = RegistrationSchema.safeParse(data);

  return {
    success,
    data: validatedData as RegistrationTypes,
    error,
  };
};
