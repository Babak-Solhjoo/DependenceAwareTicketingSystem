import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask
} from "../controllers/taskController";

const router = Router();

router.use(requireAuth);

router.get("/", listTasks);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
