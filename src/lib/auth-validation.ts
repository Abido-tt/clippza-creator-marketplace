import { z } from "zod";

export const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "uppercase", label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { id: "lowercase", label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { id: "number", label: "One number", test: (value: string) => /[0-9]/.test(value) },
  { id: "special", label: "One special character", test: (value: string) => /[^A-Za-z0-9\s]/.test(value) },
] as const;

const credentials = z.object({
  email: z.string().trim().min(1, "Enter your email.").max(255, "Email is too long.").email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const signinSchema = credentials;
export const signupSchema = credentials.extend({
  name: z.string().trim().min(1, "Enter your display name.").max(60, "Use 60 characters or fewer."),
  password: z.string().refine((value) => passwordRules.every((rule) => rule.test(value)), "Complete all five password requirements."),
});