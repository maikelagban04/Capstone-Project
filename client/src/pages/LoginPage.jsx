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
    <section className="auth-page">
      <div className="auth-page__panel">
        <span className="eyebrow">Accesso account</span>
        <h1>Accedi al tuo spazio KyronTech.</h1>
        <p>
          Ordini, carrello e checkout in un'unica esperienza elegante, veloce e ottimizzata per desktop e mobile.
        </p>
        <div className="trust-band trust-band--compact">
          <article className="trust-band__item"><span className="trust-band__icon">•</span><p>Login classico o Google OAuth</p></article>
          <article className="trust-band__item"><span className="trust-band__icon">•</span><p>Navigazione semplice e conversion-first</p></article>
        </div>
      </div>

      <div className="card auth-card-premium">
        <div className="checkout-section-title">
          <h2>Bentornato</h2>
          <p>Inserisci le tue credenziali per continuare.</p>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <form className="stack-md" onSubmit={handleSubmit}>
          <div>
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
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-premium" disabled={loading}>
            {loading ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>

        <a href={`${API_URL}/auth/google`} className="btn btn-outline-secondary btn-premium-outline w-100 mt-3">
          Continua con Google
        </a>

        <p className="text-center text-muted mt-4 mb-0">
          Non hai un account? <Link to="/register">Registrati ora</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
