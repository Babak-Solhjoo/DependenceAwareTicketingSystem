import { Task, TaskDependency } from "@prisma/client";
import { getPrisma } from "../db/prisma";
import { HttpError } from "../utils/errors";

type CreateTaskInput = {
  title: string;
  description?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  recurrence?: "DAILY" | "WEEKLY" | "MONTHLY" | null;
  dependsOnIds?: string[];
};

type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  status?: "NOT_DONE" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  recurrence?: "DAILY" | "WEEKLY" | "MONTHLY" | null;
  dependsOnIds?: string[];
};

type ListTaskQuery = {
  search?: string;
  status?: "NOT_DONE" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  sort?: "priority" | "status" | "createdAt";
  order?: "asc" | "desc";
};

const priorityOrder: Record<string, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2
};

const statusOrder: Record<string, number> = {
  NOT_DONE: 0,
  DONE: 1
};

const serializeTask = (task: Task & { dependencies?: TaskDependency[] }) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  recurrence: task.recurrence,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  dependsOnIds: (task.dependencies ?? []).map((dep) => dep.dependsOnId)
});

const ensureDependencies = async (
  userId: string,
  dependsOnIds: string[] | undefined,
  taskId?: string
) => {
  if (!dependsOnIds) {
    return [];
  }

  const uniqueIds = Array.from(new Set(dependsOnIds));
  if (taskId && uniqueIds.includes(taskId)) {
    throw new HttpError(400, "Task cannot depend on itself");
  }

  const prisma = getPrisma();
  const count = await prisma.task.count({
    where: {
      id: { in: uniqueIds },
      userId
    }
  });

  if (count !== uniqueIds.length) {
    throw new HttpError(400, "One or more dependencies are invalid");
  }

  return uniqueIds;
};

export const listTasksForUser = async (userId: string, query: ListTaskQuery) => {
  const prisma = getPrisma();
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      status: query.status,
      priority: query.priority,
      title: query.search ? { contains: query.search } : undefined
    },
    include: { dependencies: true }
  });

  let result = tasks.map((task) => serializeTask(task));

  if (query.sort) {
    const order = query.order === "desc" ? -1 : 1;
    result = result.sort((a, b) => {
      if (query.sort === "priority") {
        return (priorityOrder[a.priority] - priorityOrder[b.priority]) * order;
      }
      if (query.sort === "status") {
        return (statusOrder[a.status] - statusOrder[b.status]) * order;
      }
      return (a.createdAt.getTime() - b.createdAt.getTime()) * order;
    });
  }

  return result;
};

export const createTaskForUser = async (userId: string, data: CreateTaskInput) => {
  const prisma = getPrisma();
  const dependsOnIds = await ensureDependencies(userId, data.dependsOnIds);

  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        priority: data.priority ?? "MEDIUM",
        recurrence: data.recurrence ?? null,
        userId
      }
    });

    if (dependsOnIds.length) {
      await tx.taskDependency.createMany({
        data: dependsOnIds.map((dependsOnId) => ({
          taskId: created.id,
          dependsOnId
        }))
      });
    }

    return tx.task.findUniqueOrThrow({
      where: { id: created.id },
      include: { dependencies: true }
    });
  });

  return serializeTask(task);
};

export const updateTaskForUser = async (
  userId: string,
  taskId: string,
  data: UpdateTaskInput
) => {
  const prisma = getPrisma();
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  if (data.status === "DONE") {
    const unmet = await prisma.taskDependency.findFirst({
      where: {
        taskId,
        dependsOn: {
          status: "NOT_DONE"
        }
      }
    });

    if (unmet) {
      throw new HttpError(409, "Complete dependencies first");
    }
  }

  const dependsOnIds = await ensureDependencies(userId, data.dependsOnIds, taskId);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        recurrence: data.recurrence
      }
    });

    if (data.dependsOnIds) {
      await tx.taskDependency.deleteMany({ where: { taskId } });
      if (dependsOnIds.length) {
        await tx.taskDependency.createMany({
          data: dependsOnIds.map((dependsOnId) => ({
            taskId,
            dependsOnId
          }))
        });
      }
    }

    return tx.task.findUniqueOrThrow({
      where: { id: taskId },
      include: { dependencies: true }
    });
  });

  return serializeTask(updated);
};

export const deleteTaskForUser = async (userId: string, taskId: string) => {
  const prisma = getPrisma();
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  await prisma.task.delete({ where: { id: taskId } });
};
