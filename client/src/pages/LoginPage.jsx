import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../api/client";
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await login(form);
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="auth-card card">
      <span className="eyebrow">Account access</span>
      <h1>Welcome back</h1>
      {error ? <p className="error-text">{error}</p> : null}

      <form className="stack-md" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <button type="submit" className="button" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <a href={`${API_URL}/auth/google`} className="button button--ghost auth-social">
        Continue with Google
      </a>

      <p>
        Need an account? <Link to="/register">Register here</Link>
      </p>
    </section>
  );
};

export default LoginPage;
