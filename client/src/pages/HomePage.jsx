import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import ProductCard from "../components/ProductCard";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    componentTypes: [],
    minPrice: 0,
    maxPrice: 1000,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Carica le opzioni di filtro disponibili
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const data = await apiRequest("/products/filters");
        setFilterOptions(data);
      } catch (err) {
        console.error("Error loading filter options:", err);
      }
    };

    loadFilterOptions();
  }, []);

  // Carica prodotti con filtri
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
    <div className="stack-lg">
      <section className="hero">
        <div>
          <span className="eyebrow">PC Components & Parts</span>
          <h1>Your One-Stop Shop for Premium Computer Hardware</h1>
          <p>
            Discover high-quality PC components from leading brands. Find everything you need to
            build or upgrade your system with competitive pricing and expert selection.
          </p>
        </div>
        <div className="hero__panel">
          <label htmlFor="search">Search catalog</label>
          <input
            id="search"
            type="search"
            placeholder="Search by title, brand or model"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <p>
            Explore our extensive selection of computer components and accessories.
            {filterOptions.totalProducts > 0 && ` (${filterOptions.totalProducts} products available)`}
          </p>
        </div>
      </section>

      {/* Mobile Filter Toggle */}
      <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {/* Filters Container */}
      <div className={`filters-container ${showFilters ? "active" : ""}`}>
        {/* Component Type Filter */}
        {filterOptions.componentTypes.length > 0 && (
          <section className="filter-section">
            <h3>Component Type</h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${selectedComponent === "" ? "active" : ""}`}
                onClick={() => setSelectedComponent("")}
              >
                All Types
              </button>
              {filterOptions.componentTypes.map((type) => (
                <button
                  key={type}
                  className={`filter-btn ${selectedComponent === type ? "active" : ""}`}
                  onClick={() => setSelectedComponent(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Brand Filter */}
        {filterOptions.brands.length > 0 && (
          <section className="filter-section">
            <h3>Brand</h3>
            <div className="filter-dropdown">
              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                <option value="">All Brands ({filterOptions.brands.length})</option>
                {filterOptions.brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </section>
        )}

        {/* Price Range Filter */}
        <section className="filter-section">
          <h3>Price Range</h3>
          <div className="price-filter">
            <input
              type="number"
              placeholder={`Min (€${Math.floor(filterOptions.minPrice)})`}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min={Math.floor(filterOptions.minPrice)}
              max={Math.ceil(filterOptions.maxPrice)}
            />
            <span>-</span>
            <input
              type="number"
              placeholder={`Max (€${Math.ceil(filterOptions.maxPrice)})`}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min={Math.floor(filterOptions.minPrice)}
              max={Math.ceil(filterOptions.maxPrice)}
            />
          </div>
          <small className="price-hint">
            Available: €{Math.floor(filterOptions.minPrice)} - €{Math.ceil(filterOptions.maxPrice)}
          </small>
        </section>

        {/* Stock Filter */}
        <section className="filter-section">
          <h3>Availability</h3>
          <div className="filter-radio">
            <label>
              <input
                type="radio"
                name="stock"
                value="all"
                checked={inStock === "all"}
                onChange={(e) => setInStock(e.target.value)}
              />
              All Products
            </label>
            <label>
              <input
                type="radio"
                name="stock"
                value="true"
                checked={inStock === "true"}
                onChange={(e) => setInStock(e.target.value)}
              />
              In Stock
            </label>
            <label>
              <input
                type="radio"
                name="stock"
                value="false"
                checked={inStock === "false"}
                onChange={(e) => setInStock(e.target.value)}
              />
              Out of Stock
            </label>
          </div>
        </section>

        {/* Clear Filters Button */}
        <button className="filter-clear" onClick={handleClearFilters}>
          Clear All Filters
        </button>
      </div>

      {loading ? <p className="loading">Loading products...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="product-grid">
        {products.length > 0 ? (
          products.map((product) => <ProductCard key={product._id} product={product} />)
        ) : (
          <p className="no-products">No products found. Try adjusting your search or filters.</p>
        )}
      </section>
    </div>
  );
};

export default HomePage;
