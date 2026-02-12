export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "NOT_DONE" | "DONE";
export type Recurrence = "DAILY" | "WEEKLY" | "MONTHLY" | null;

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  recurrence: Recurrence;
  createdAt: string;
  updatedAt: string;
  dependsOnIds: string[];
};

export type User = {
  id: string;
  email: string;
};
