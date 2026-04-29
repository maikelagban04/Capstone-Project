import { useAuth } from "../hooks/useAuth";

const ProfilePage = () => {
  const { auth } = useAuth();

  return (
    <div className="page-stack">
      <section className="section-head">
        <div>
          <span className="section-kicker">Profilo</span>
          <h1>Dati account.</h1>
        </div>
      </section>

      <section className="info-card-grid">
        <article className="info-card">
          <small>Nome</small>
          <strong>{auth?.name}</strong>
        </article>
        <article className="info-card">
          <small>Email</small>
          <strong>{auth?.email}</strong>
        </article>
        <article className="info-card">
          <small>Ruolo</small>
          <strong>{auth?.role}</strong>
        </article>
      </section>
    </div>
  );
};

export default ProfilePage;
