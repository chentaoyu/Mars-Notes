import { z } from "zod";

// 认证验证
export const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(8, "密码至少 8 位")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "密码必须包含字母和数字"),
  name: z.string().min(1, "昵称不能为空").max(50, "昵称最多 50 字符").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "密码不能为空"),
});

// 笔记验证
export const createNoteSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200, "标题最多 200 字符"),
  content: z.string().max(100000, "内容过长").default(""),
  notebookId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && typeof val === "string" && val.trim() !== "" ? val : null)),
  tagIds: z.array(z.string()).optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200, "标题最多 200 字符").optional(),
  content: z.string().max(100000, "内容过长").optional(),
  notebookId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
});

// 用户验证
export const updateUserSchema = z.object({
  name: z.string().min(1, "昵称不能为空").max(20, "昵称最多 20 字符").optional(),
  image: z.string().url("请输入有效的图片URL").optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "当前密码不能为空"),
  newPassword: z
    .string()
    .min(8, "密码至少 8 位")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "密码必须包含字母和数字"),
  confirmPassword: z.string().min(1, "确认密码不能为空"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "请输入密码确认"),
});

// 类型导出
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

