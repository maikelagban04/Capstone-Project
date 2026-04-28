import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import ProductCard from "../components/ProductCard";

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ brands: [], componentTypes: [], minPrice: 0, maxPrice: 1000, totalProducts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const data = await apiRequest("/products/filters");
        setFilterOptions(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadFilterOptions();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (selectedComponent) params.append("componentType", selectedComponent);
        if (selectedBrand) params.append("brand", selectedBrand);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (inStock !== "all") params.append("inStock", inStock);
        const query = params.toString() ? `?${params.toString()}` : "";
        const data = await apiRequest(`/products${query}`);
        setProducts(data);
        setError("");
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [search, selectedComponent, selectedBrand, minPrice, maxPrice, inStock]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedComponent("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setInStock("all");
  };

  return (
    <div className="catalog-page stack-lg">
      <section className="catalog-hero card p-4 p-lg-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <span className="eyebrow">Catalog</span>
            <h1>Browse premium PC components with confidence</h1>
            <p className="lead text-muted">
              Search by brand, type, price and availability. Every product is optimized for fast delivery and high compatibility.
            </p>
          </div>
          <div className="col-lg-5">
            <div className="search-panel p-4 rounded-4 bg-surface shadow-sm">
              <label htmlFor="catalog-search" className="form-label text-uppercase small text-muted">
                Search catalog
              </label>
              <div className="input-group mb-3">
                <span className="input-group-text bg-transparent border-0 text-muted">🔎</span>
                <input
                  id="catalog-search"
                  type="search"
                  className="form-control border-0 bg-transparent"
                  placeholder="Search by title, brand or model"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <p className="mb-0 text-secondary">
                {filterOptions.totalProducts} products available — refined for performance builders.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="filter-panel card p-4">
        <div className="d-flex align-items-center justify-content-between flex-column flex-md-row gap-3">
          <div>
            <h2 className="h5 mb-1">Refine results</h2>
            <p className="text-muted mb-0">Advanced filters for fast product selection.</p>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setShowFilters((prev) => !prev)}>
              {showFilters ? "Hide filters" : "Show filters"}
            </button>
            <button type="button" className="btn btn-soft-secondary btn-sm" onClick={handleClearFilters}>
              Clear all
            </button>
          </div>
        </div>

        <div className={`row g-3 mt-3 ${showFilters ? "d-flex" : "d-none d-md-flex"}`}>
          <div className="col-md-4">
            <div className="filter-block p-3 rounded-4 bg-surface">
              <h3 className="h6 text-uppercase text-muted mb-3">Component type</h3>
              <div className="d-flex flex-wrap gap-2">
                <button className={`btn btn-sm ${selectedComponent === "" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setSelectedComponent("")}>
                  All types
                </button>
                {filterOptions.componentTypes.map((type) => (
                  <button
                    key={type}
                    className={`btn btn-sm ${selectedComponent === type ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setSelectedComponent(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="filter-block p-3 rounded-4 bg-surface">
              <h3 className="h6 text-uppercase text-muted mb-3">Brand</h3>
              <select className="form-select" value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                <option value="">All Brands</option>
                {filterOptions.brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-4">
            <div className="filter-block p-3 rounded-4 bg-surface">
              <h3 className="h6 text-uppercase text-muted mb-3">Availability</h3>
              <div className="d-flex gap-2 flex-wrap">
                {['all', 'true', 'false'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`btn btn-sm ${inStock === value ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setInStock(value)}
                  >
                    {value === 'all' ? 'All' : value === 'true' ? 'In stock' : 'Out of stock'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <label className="form-label text-muted">Min price</label>
            <input
              type="number"
              className="form-control"
              placeholder={`€${Math.floor(filterOptions.minPrice)}`}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min={Math.floor(filterOptions.minPrice)}
              max={Math.ceil(filterOptions.maxPrice)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label text-muted">Max price</label>
            <input
              type="number"
              className="form-control"
              placeholder={`€${Math.ceil(filterOptions.maxPrice)}`}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min={Math.floor(filterOptions.minPrice)}
              max={Math.ceil(filterOptions.maxPrice)}
            />
          </div>
        </div>
      </section>

      {loading ? <div className="text-center py-5">Loading products...</div> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="product-grid row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="col">
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="card p-4 text-center text-muted">No products found. Adjust your filters to continue.</div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CatalogPage;
