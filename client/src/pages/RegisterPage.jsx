import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../api/client";
import { useAuth } from "../hooks/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await register(form);
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="auth-layout card p-4 p-md-5 rounded-5 shadow-sm">
      <div className="mb-4">
        <span className="eyebrow">Create account</span>
        <h1 className="h3 mt-2">Start managing your store</h1>
        <p className="text-muted">Register once and streamline your checkout, orders and dashboard access.</p>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-12">
          <label className="form-label">Full name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Your name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </div>
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
            minLength="6"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </div>
        <div className="col-12 d-grid">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </div>
      </form>

      <a href={`${API_URL}/auth/google`} className="btn btn-outline-secondary w-100 mt-3">
        Continue with Google
      </a>

      <p className="text-center text-muted mt-4 mb-0">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </section>
  );
};

export default RegisterPage;
