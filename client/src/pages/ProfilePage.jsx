import { useAuth } from "../hooks/useAuth";

const ProfilePage = () => {
  const { auth } = useAuth();

  return (
    <div className="stack-2xl">
      <section className="section-head">
        <div>
          <span className="eyebrow">Profilo</span>
          <h1>Panoramica account semplice e leggibile.</h1>
        </div>
      </section>

      <section className="profile-grid">
        <article className="card info-panel">
          <h2>Dati account</h2>
          <div className="summary-metrics">
            <div className="metric-card">
              <span>Nome</span>
              <strong>{auth?.name}</strong>
            </div>
            <div className="metric-card">
              <span>Email</span>
              <strong>{auth?.email}</strong>
            </div>
            <div className="metric-card">
              <span>Ruolo</span>
              <strong>{auth?.role}</strong>
            </div>
          </div>
        </article>

        <article className="card info-panel">
          <h2>Stato esperienza</h2>
          <p className="text-muted mb-0">
            Questa area può crescere facilmente con wishlist, indirizzi salvati, metodi di pagamento e preferenze
            personali senza cambiare il layout di base.
          </p>
        </article>
      </section>
    </div>
  );
};

export default ProfilePage;
