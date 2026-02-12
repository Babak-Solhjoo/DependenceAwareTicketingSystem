import cron from "node-cron";
import { Task } from "@prisma/client";
import { getPrisma } from "../db/prisma";

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const nextOccurrence = (task: Task) => {
  const base = task.lastRecurrenceAt ?? task.createdAt;
  switch (task.recurrence) {
    case "DAILY":
      return addDays(base, 1);
    case "WEEKLY":
      return addDays(base, 7);
    case "MONTHLY":
      return addDays(base, 30);
    default:
      return null;
  }
};

export const runRecurringTasks = async () => {
  const prisma = getPrisma();
  const now = new Date();
  const tasks = await prisma.task.findMany({
    where: { recurrence: { not: null } }
  });

  for (const task of tasks) {
    const nextAt = nextOccurrence(task);
    if (!nextAt || nextAt > now) {
      continue;
    }

    await prisma.$transaction(async (tx) => {
      await tx.task.create({
        data: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          recurrence: null,
          userId: task.userId,
          status: "NOT_DONE"
        }
      });

      await tx.task.update({
        where: { id: task.id },
        data: { lastRecurrenceAt: now }
      });
    });
  }
};

export const startRecurringScheduler = () => {
  cron.schedule("*/15 * * * *", () => {
    runRecurringTasks().catch((error) => {
      console.error("Recurring task scheduler error", error);
    });
  });
};
