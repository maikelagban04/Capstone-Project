import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import ProductCard from "../components/ProductCard";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await apiRequest("/products?limit=6");
        setFeatured(data.slice(0, 6));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadFeatured();
  }, []);

  return (
    <div className="home-page stack-lg">
      <section className="hero-banner card p-4 p-lg-5 overflow-hidden rounded-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <span className="eyebrow">Premium hardware</span>
            <h1 className="display-6 fw-bold">Build faster, game stronger, ship sooner.</h1>
            <p className="lead text-muted mb-4">
              Discover a premium catalog of PC components optimized for pro builders, gamers and system shops.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3">
              <Link to="/catalog" className="btn btn-primary btn-lg">
                Browse catalog
              </Link>
              <Link to="/cart" className="btn btn-outline-secondary btn-lg">
                View cart
              </Link>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="hero-mockup p-4 rounded-5 bg-surface shadow-sm">
              <h2 className="h5 mb-3">Shop by performance</h2>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge badge-pill">Gaming</span>
                <span className="badge badge-pill">Creator</span>
                <span className="badge badge-pill">Workstation</span>
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <div className="feature-box p-3 rounded-4 bg-white bg-opacity-75">
                    <strong>Fast shipping</strong>
                    <p className="small text-muted mb-0">Next-day options available.</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="feature-box p-3 rounded-4 bg-white bg-opacity-75">
                    <strong>Verified brands</strong>
                    <p className="small text-muted mb-0">Trusted components only.</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="feature-box p-3 rounded-4 bg-white bg-opacity-75">
                    <strong>Premium support</strong>
                    <p className="small text-muted mb-0">Dedicated pro assistance.</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="feature-box p-3 rounded-4 bg-white bg-opacity-75">
                    <strong>Smart filters</strong>
                    <p className="small text-muted mb-0">Find parts in seconds.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-heading d-flex align-items-center justify-content-between gap-3">
        <div>
          <span className="eyebrow">Featured range</span>
          <h2>Top picks for your next build</h2>
        </div>
        <Link to="/catalog" className="text-decoration-none text-primary">See full catalog →</Link>
      </section>

      {loading ? <div className="text-center py-5">Loading products...</div> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="product-grid row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4">
        {featured.map((product) => (
          <div key={product._id} className="col">
            <ProductCard product={product} />
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
