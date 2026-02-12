import { Navigate, Route, Routes } from "react-router-dom";
import { authStore } from "./store/authStore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tasks from "./pages/Tasks";
import Stats from "./pages/Stats";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = authStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/tasks" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/tasks"
      element={
        <RequireAuth>
          <Tasks />
        </RequireAuth>
      }
    />
    <Route
      path="/stats"
      element={
        <RequireAuth>
          <Stats />
        </RequireAuth>
      }
    />
    <Route
      path="/calendar"
      element={
        <RequireAuth>
          <Calendar />
        </RequireAuth>
      }
    />
    <Route
      path="/profile"
      element={
        <RequireAuth>
          <Profile />
        </RequireAuth>
      }
    />
  </Routes>
);

export default App;
