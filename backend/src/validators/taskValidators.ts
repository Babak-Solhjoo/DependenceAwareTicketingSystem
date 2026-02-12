import { z } from "zod";

export const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const statusEnum = z.enum(["NOT_DONE", "DONE"]);
export const recurrenceEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().max(2000).optional().nullable(),
  priority: priorityEnum.optional(),
  recurrence: recurrenceEnum.optional().nullable(),
  dependsOnIds: z.array(z.string()).optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  recurrence: recurrenceEnum.optional().nullable(),
  dependsOnIds: z.array(z.string()).optional()
});

export const listTasksSchema = z.object({
  search: z.string().optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  sort: z.enum(["priority", "status", "createdAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional()
});
