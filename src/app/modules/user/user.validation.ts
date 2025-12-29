import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "This field is required" : "Not a string",
    })
    .min(2, { message: "Name must be at least 2 character long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  email: z
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 character long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),
  //1 uppercase, 1 special character, i gigit, 8 character min
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "This field is required" : "Not a string",
    })
    .min(8, { message: "Password must be at least 8 character long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number",
    }),
  phone: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "This field is required" : "Not a string",
    })
    .regex(/^(?:\+880\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801xxxxxxxxx or 01xxxxxxxxx",
    })
    .optional(),
  address: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "This field is required" : "Not a string",
    })
    .max(200, { message: "Address can not exceed 200 characters." })
    .optional(),
});

export const updateUserZodSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "This field is required" : "Not a string",
    })
    .min(2, { message: "Name must be at least 2 character long." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .optional(),
  //1 uppercase, 1 special character, i gigit, 8 character min
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "This field is required" : "Not a string",
    })
    .min(8, { message: "Password must be at least 8 character long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number",
    })
    .optional(),
  phone: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "This field is required" : "Not a string",
    })
    .regex(/^(?:\+880\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801xxxxxxxxx or 01xxxxxxxxx",
    })
    .optional(),

  role: z.enum(Object.values(Role) as [string]).optional(),
  isActive: z.enum(Object.values(IsActive) as [string]).optional(),
  isDeleted: z
    .boolean({
      error: (issue) =>
        issue.input === undefined ? "This field is required" : "Not a string",
    })
    .optional(),
  isVerified: z
    .boolean({
      error: (issue) =>
        issue.input === undefined ? "This field is required" : "Not a string",
    })
    .optional(),
  address: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "This field is required" : "Not a string",
    })
    .max(200, { message: "Address can not exceed 200 characters." })
    .optional(),
});
