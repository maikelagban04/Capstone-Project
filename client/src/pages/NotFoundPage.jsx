import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <section className="card empty-state">
      <span className="eyebrow">404</span>
      <h1>Page not found</h1>
      <p>The route you requested does not exist in this storefront.</p>
      <Link to="/" className="button">
        Go home
      </Link>
    </section>
  );
};

export default NotFoundPage;
