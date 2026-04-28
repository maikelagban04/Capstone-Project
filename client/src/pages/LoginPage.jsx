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
    <section className="auth-layout card p-4 p-md-5 rounded-5 shadow-sm">
      <div className="mb-4">
        <span className="eyebrow">Account access</span>
        <h1 className="h3 mt-2">Welcome back</h1>
        <p className="text-muted">Sign in to access your orders, cart and premium checkout flow.</p>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-12">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </div>
        <div className="col-12">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </div>
        <div className="col-12 d-grid">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>
      </form>

      <a href={`${API_URL}/auth/google`} className="btn btn-outline-secondary w-100 mt-3">
        Continue with Google
      </a>

      <p className="text-center text-muted mt-4 mb-0">
        Need an account? <Link to="/register">Register here</Link>
      </p>
    </section>
  );
};

export default LoginPage;
