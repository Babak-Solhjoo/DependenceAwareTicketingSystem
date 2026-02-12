import { Link, useNavigate } from "react-router-dom";
import { authStore } from "../store/authStore";
import { useEffect, useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const { login, token, loading, error } = authStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (token) {
      navigate("/tasks");
    }
  }, [token, navigate]);

  return (
    <div className="auth-shell">
      <div className="auth-card glass">
        <h1>Welcome back</h1>
        <p>Log in to manage your shimmering task universe.</p>
        <div className="input-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error && <div className="notice">{error}</div>}
        <button onClick={() => login(email, password)} disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
        <Link to="/register">Need an account? Register</Link>
      </div>
    </div>
  );
};

export default Login;
