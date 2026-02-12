import { create } from "zustand";
import api from "../lib/api";
import type { Task, Priority, TaskStatus } from "../types";

export type TaskFilters = {
  search?: string;
  status?: TaskStatus | "";
  priority?: Priority | "";
  sort?: "priority" | "status" | "createdAt";
  order?: "asc" | "desc";
};

type TaskState = {
  tasks: Task[];
  filters: TaskFilters;
  loading: boolean;
  error: string | null;
  fetchTasks: (filters: TaskFilters) => Promise<void>;
  createTask: (payload: {
    title: string;
    description?: string | null;
    priority: Priority;
    recurrence: "DAILY" | "WEEKLY" | "MONTHLY" | null;
    dependsOnIds: string[];
  }) => Promise<void>;
  updateTask: (id: string, payload: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

export const taskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filters: {},
  loading: false,
  error: null,
  fetchTasks: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.sort) params.sort = filters.sort;
      if (filters.order) params.order = filters.order;

      const res = await api.get("/api/tasks", { params });
      set({ tasks: res.data.tasks, loading: false, filters });
    } catch (error) {
      set({ loading: false, error: "Failed to load tasks" });
    }
  },
  createTask: async (payload) => {
    set({ loading: true, error: null });
    try {
      await api.post("/api/tasks", payload);
      await get().fetchTasks(get().filters);
    } catch (error) {
      set({ loading: false, error: "Failed to create task" });
    }
  },
  updateTask: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await api.patch(`/api/tasks/${id}`, payload);
      await get().fetchTasks(get().filters);
    } catch (error) {
      set({ loading: false, error: "Failed to update task" });
    }
  },
  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/api/tasks/${id}`);
      await get().fetchTasks(get().filters);
    } catch (error) {
      set({ loading: false, error: "Failed to delete task" });
    }
  }
}));
