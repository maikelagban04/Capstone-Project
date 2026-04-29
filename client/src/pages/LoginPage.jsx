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
      navigate(location.state?.from?.pathname || "/");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-layout__intro">
        <span className="section-kicker">Login</span>
        <h1>Accedi al tuo account.</h1>
        <p>Ordini, carrello e checkout restano in un flusso semplice e coerente.</p>
      </div>

      <div className="auth-card">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
          <button type="submit" className="btn btn-primary btn-shell btn-shell--primary" disabled={loading}>
            {loading ? "Accesso..." : "Accedi"}
          </button>
        </form>
        <a href={`${API_URL}/auth/google`} className="btn btn-outline-secondary btn-shell">
          Continua con Google
        </a>
        <p className="auth-card__switch">
          Non hai un account? <Link to="/register">Registrati</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
