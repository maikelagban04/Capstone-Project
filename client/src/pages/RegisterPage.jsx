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
    <section className="auth-card card">
      <span className="eyebrow">Create account</span>
      <h1>Start managing your store</h1>
      {error ? <p className="error-text">{error}</p> : null}

      <form className="stack-md" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
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
          minLength="6"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <button type="submit" className="button" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
      </form>

      <a href={`${API_URL}/auth/google`} className="button button--ghost auth-social">
        Continue with Google
      </a>

      <p>
        Already registered? <Link to="/login">Login here</Link>
      </p>
    </section>
  );
};

export default RegisterPage;
