import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <section className="empty-panel">
      <span className="section-kicker">404</span>
      <h1>Pagina non trovata.</h1>
      <p>La route richiesta non esiste oppure manca il rewrite lato deploy.</p>
      <Link to="/" className="btn btn-primary btn-shell btn-shell--primary">
        Torna alla home
      </Link>
    </section>
  );
};

export default NotFoundPage;
