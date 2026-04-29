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
    <section className="auth-layout">
      <div className="auth-layout__intro">
        <span className="section-kicker">Registrazione</span>
        <h1>Crea il tuo account KyronTech.</h1>
        <p>Una volta registrato puoi finalizzare ordini più in fretta e gestire il tuo storico.</p>
      </div>

      <div className="auth-card">
        {error ? <div className="alert alert-danger">{error}</div> : null}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control"
            placeholder="Nome completo"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
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
            minLength="6"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
          <button type="submit" className="btn btn-primary btn-shell btn-shell--primary" disabled={loading}>
            {loading ? "Creazione..." : "Registrati"}
          </button>
        </form>
        <a href={`${API_URL}/auth/google`} className="btn btn-outline-secondary btn-shell">
          Registrati con Google
        </a>
        <p className="auth-card__switch">
          Hai già un account? <Link to="/login">Accedi</Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;
