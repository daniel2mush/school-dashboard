import z from "zod";

const genderEnum = z.enum(["Male", "Female", "Other"]);

const RegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(100),
  name: z.string(),
  initials: z.string().optional(),
  gender: genderEnum.default("Male"),
  dateOfBirth: z.coerce.date(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().optional(),
  specialization: z.string(), // For teachers
});

export type RegistrationTypes = z.infer<typeof RegistrationSchema>;

export const ValidateRegistration = (data: RegistrationTypes) => {
  const {
    success,
    data: validatedData,
    error,
  } = RegistrationSchema.safeParse(data);

  return {
    success,
    data: validatedData,
    error,
  };
};

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type LoginTypes = z.infer<typeof LoginSchema>;

export const ValidateLogin = (data: LoginTypes) => {
  const { success, data: validatedData, error } = LoginSchema.safeParse(data);

  return {
    success,
    data: validatedData,
    error,
  };
};
