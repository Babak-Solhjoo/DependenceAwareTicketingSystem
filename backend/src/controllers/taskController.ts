import { Request, Response, NextFunction } from "express";
import {
  createTaskSchema,
  listTasksSchema,
  updateTaskSchema
} from "../validators/taskValidators";
import {
  createTaskForUser,
  deleteTaskForUser,
  listTasksForUser,
  updateTaskForUser
} from "../services/taskService";

export const listTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listTasksSchema.parse(req.query);
    const tasks = await listTasksForUser(req.user!.id, query);
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createTaskSchema.parse(req.body);
    const task = await createTaskForUser(req.user!.id, data);
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateTaskSchema.parse(req.body);
    const task = await updateTaskForUser(req.user!.id, req.params.id, data);
    res.json({ task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteTaskForUser(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
