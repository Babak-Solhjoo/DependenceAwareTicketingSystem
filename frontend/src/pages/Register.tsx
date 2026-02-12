import { Link, useNavigate } from "react-router-dom";
import { authStore } from "../store/authStore";
import { useEffect, useState } from "react";

const Register = () => {
  const navigate = useNavigate();
  const { register, token, loading, error } = authStore();
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
        <h1>Create your space</h1>
        <p>Set up an account to orchestrate your tasks in style.</p>
        <div className="input-group">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error && <div className="notice">{error}</div>}
        <button onClick={() => register(email, password)} disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
        <Link to="/login">Already have an account? Log in</Link>
      </div>
    </div>
  );
};

export default Register;
