import { z } from "zod";

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  hourlyRate: z.number().positive().multipleOf(0.01),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const createTimeEntrySchema = z.object({
  employeeId: z.number().int().positive(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  hours: z
    .number()
    .min(0.25, "Minimum 0.25 hours")
    .max(24, "Maximum 24 hours"),
});

export const updateTimeEntrySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  hours: z
    .number()
    .min(0.25, "Minimum 0.25 hours")
    .max(24, "Maximum 24 hours")
    .optional(),
});

export const approvalActionSchema = z.object({
  action: z.enum(["approved", "rejected"]),
});

export const weekParamSchema = z.object({
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "weekStart must be in YYYY-MM-DD format"),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
export type ApprovalActionInput = z.infer<typeof approvalActionSchema>;
