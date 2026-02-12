import { create } from "zustand";
import api from "../lib/api";
import type { AxiosError } from "axios";
import type { User } from "../types";

type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const tokenFromStorage = localStorage.getItem("token");
const userFromStorage = localStorage.getItem("user");

export const authStore = create<AuthState>((set) => ({
  token: tokenFromStorage,
  user: userFromStorage ? JSON.parse(userFromStorage) : null,
  loading: false,
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      set({ token: res.data.token, user: res.data.user, loading: false });
    } catch (error) {
      const message = (error as AxiosError<{ message?: string }>)?.response?.data?.message;
      set({ loading: false, error: message ?? "Login failed" });
    }
  },
  register: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/api/auth/register", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      set({ token: res.data.token, user: res.data.user, loading: false });
    } catch (error) {
      const message = (error as AxiosError<{ message?: string }>)?.response?.data?.message;
      set({ loading: false, error: message ?? "Registration failed" });
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  }
}));
