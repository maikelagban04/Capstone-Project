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
    <section className="auth-page">
      <div className="auth-page__panel">
        <span className="eyebrow">Nuovo account</span>
        <h1>Entra nell'ecosistema KyronTech.</h1>
        <p>
          Registrati per velocizzare i prossimi acquisti, gestire ordini e avere una customer experience più lineare.
        </p>
        <div className="spotlight-card">
          <h3>Perché conviene</h3>
          <p>Checkout rapido, storico ordini chiaro e un'esperienza coerente fra desktop, tablet e smartphone.</p>
        </div>
      </div>

      <div className="card auth-card-premium">
        <div className="checkout-section-title">
          <h2>Crea il tuo account</h2>
          <p>Pochi dati essenziali e puoi iniziare subito.</p>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <form className="stack-md" onSubmit={handleSubmit}>
          <div>
            <label className="form-label">Nome completo</label>
            <input
              type="text"
              className="form-control"
              placeholder="Mario Rossi"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </div>
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
              placeholder="Minimo 6 caratteri"
              minLength="6"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-premium" disabled={loading}>
            {loading ? "Creazione account..." : "Registrati"}
          </button>
        </form>

        <a href={`${API_URL}/auth/google`} className="btn btn-outline-secondary btn-premium-outline w-100 mt-3">
          Registrati con Google
        </a>

        <p className="text-center text-muted mt-4 mb-0">
          Hai già un account? <Link to="/login">Accedi</Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;
