import { z } from "zod";

export const loginZodSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long"),
  // .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  // .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  // .regex(/[0-9]/, "Password must contain at least one number")
  // .regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
});

export const registerZodSchema = z.object({
  email: z.email("Invalid email address"),
  name: z
    .string("Name must be string")
    .min(3, "Name must be 3 character long")
    .max(100, "Name must be less than 100 character long"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long"),
  // .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  // .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  // .regex(/[0-9]/, "Password must contain at least one number")
  // .regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
  image: z
    .instanceof(File, { message: "Please upload a valid image file." })
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: "Image size must be less than 2MB.",
    })
    .refine((file) => ["image/jpeg", "image/jpg", "image/png"].includes(file.type), {
      message: "Only .jpg, .jpeg, .png formats are supported.",
    })
    .optional(),
  gender: z.string("Gender must be a string"),
});

export type ILoginPayload = z.infer<typeof loginZodSchema>;
export type IRegisterPayload = z.infer<typeof registerZodSchema>;

export const resetPasswordZodSchema = z.object({
  email: z.email("Invalid email address"),
  otp: z.string(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long"),
  // .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  // .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  // .regex(/[0-9]/, "Password must contain at least one number")
  // .regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
});

export type IResetPasswordPayload = z.infer<typeof resetPasswordZodSchema>;
