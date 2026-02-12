import axios from "axios";
import { authStore } from "../store/authStore";

const getBaseURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (apiUrl) {
    return apiUrl;
  }
  
  // Only use localhost in development (http, not https)
  if (import.meta.env.DEV) {
    return "http://localhost:4000";
  }
  
  // In production, the API URL must be explicitly set
  console.error("VITE_API_URL environment variable not set for production");
  return window.location.origin;
};

const api = axios.create({
  baseURL: getBaseURL()
});

api.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
