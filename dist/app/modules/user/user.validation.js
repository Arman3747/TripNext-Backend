"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({
        error: (issue) => issue.input === undefined ? "This field is required" : "Not a string",
    })
        .min(2, { message: "Name must be at least 2 character long." })
        .max(50, { message: "Name cannot exceed 50 characters." }),
    email: zod_1.default
        .email({ message: "Invalid email address format." })
        .min(5, { message: "Email must be at least 5 character long." })
        .max(100, { message: "Email cannot exceed 100 characters." }),
    //1 uppercase, 1 special character, i gigit, 8 character min
    password: zod_1.default
        .string({
        error: (issue) => issue.input === undefined ? "This field is required" : "Not a string",
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
    phone: zod_1.default
        .string({
        error: (issue) => issue.input === undefined ? "This field is required" : "Not a string",
    })
        .regex(/^(?:\+880\d{9}|01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801xxxxxxxxx or 01xxxxxxxxx",
    })
        .optional(),
    address: zod_1.default
        .string({
        error: (issue) => issue.input === undefined ? "This field is required" : "Not a string",
    })
        .max(200, { message: "Address can not exceed 200 characters." })
        .optional(),
});
exports.updateUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({
        error: (issue) => issue.input === undefined ? "This field is required" : "Not a string",
    })
        .min(2, { message: "Name must be at least 2 character long." })
        .max(50, { message: "Name cannot exceed 50 characters." })
        .optional(),
    //1 uppercase, 1 special character, i gigit, 8 character min
    // password: z
    //   .string({
    //     error: (issue) =>
    //       issue.input === undefined ? "This field is required" : "Not a string",
    //   })
    //   .min(8, { message: "Password must be at least 8 character long." })
    //   .regex(/^(?=.*[A-Z])/, {
    //     message: "Password must contain at least 1 uppercase letter.",
    //   })
    //   .regex(/^(?=.*[!@#$%^&*])/, {
    //     message: "Password must contain at least 1 special character.",
    //   })
    //   .regex(/^(?=.*\d)/, {
    //     message: "Password must contain at least 1 number",
    //   })
    //   .optional(),
    phone: zod_1.default
        .string({
        error: (issue) => issue.input === undefined ? "This field is required" : "Not a string",
    })
        .regex(/^(?:\+880\d{9}|01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801xxxxxxxxx or 01xxxxxxxxx",
    })
        .optional(),
    role: zod_1.default.enum(Object.values(user_interface_1.Role)).optional(),
    isActive: zod_1.default.enum(Object.values(user_interface_1.IsActive)).optional(),
    isDeleted: zod_1.default
        .boolean({
        error: (issue) => issue.input === undefined ? "This field is required" : "Not a string",
    })
        .optional(),
    isVerified: zod_1.default
        .boolean({
        error: (issue) => issue.input === undefined ? "This field is required" : "Not a string",
    })
        .optional(),
    address: zod_1.default
        .string({
        error: (issue) => issue.input === undefined ? "This field is required" : "Not a string",
    })
        .max(200, { message: "Address can not exceed 200 characters." })
        .optional(),
});
