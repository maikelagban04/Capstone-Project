import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import ProductCard from "../components/ProductCard";

const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    componentTypes: [],
    minPrice: 0,
    maxPrice: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedComponent, setSelectedComponent] = useState(searchParams.get("componentType") || "");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const data = await apiRequest("/products/filters");
        setFilterOptions(data);
      } catch (requestError) {
        console.error(requestError);
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

  const activeFilters = useMemo(
    () => [selectedBrand, minPrice, maxPrice, inStock !== "all" ? inStock : ""].filter(Boolean).length,
    [selectedBrand, minPrice, maxPrice, inStock],
  );

  const clearFilters = () => {
    setSearch("");
    setSelectedComponent("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setInStock("all");
  };

  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((product) => {
      counts[product.componentType] = (counts[product.componentType] || 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <div className="page-stack">
      <section className="catalog-layout">
        <aside className={`catalog-sidebar ${filtersOpen ? "is-open" : ""}`}>
          <h3 className="catalog-sidebar__title">Categorie</h3>
          <div className="category-list">
            <button
              type="button"
              className={`category-list__item ${selectedComponent === "" ? "is-active" : ""}`}
              onClick={() => setSelectedComponent("")}
            >
              <span>Tutti</span>
              <small>{filterOptions.totalProducts || products.length}</small>
            </button>
            {filterOptions.componentTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={`category-list__item ${selectedComponent === type ? "is-active" : ""}`}
                onClick={() => setSelectedComponent(type)}
              >
                <span>{type}</span>
                {categoryCounts[type] ? <small>{categoryCounts[type]}</small> : null}
              </button>
            ))}
          </div>

          <div className="catalog-sidebar__head">
            <strong>Filtri</strong>
            <button type="button" className="chip" onClick={clearFilters} aria-label="Reset filtri">
              Reset {activeFilters ? `(${activeFilters})` : ""}
            </button>
          </div>

          <div className="filter-group">
            <label htmlFor="catalog-search">Cerca</label>
            <input
              id="catalog-search"
              type="search"
              className="form-control"
              placeholder="Titolo, brand, modello"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="brand-filter">Brand</label>
            <select
              id="brand-filter"
              className="form-select"
              value={selectedBrand}
              onChange={(event) => setSelectedBrand(event.target.value)}
            >
              <option value="">Tutti i brand</option>
              {filterOptions.brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Prezzo</label>
            <div className="price-row">
              <input
                type="number"
                className="form-control"
                placeholder={`Da ${Math.floor(filterOptions.minPrice)}`}
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
              />
              <input
                type="number"
                className="form-control"
                placeholder={`A ${Math.ceil(filterOptions.maxPrice)}`}
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Disponibilità</label>
            <div className="chip-row">
              {[
                ["all", "Tutti"],
                ["true", "Disponibili"],
                ["false", "Esauriti"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`chip ${inStock === value ? "is-active" : ""}`}
                  onClick={() => setInStock(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="catalog-content">
          <div className="catalog-toolbar">
            <div>
              <h2>{selectedComponent || "Tutti i prodotti"}</h2>
              <span>{products.length} prodotti disponibili</span>
            </div>
            <button
              type="button"
              className="btn-shell d-lg-none"
              onClick={() => setFiltersOpen((current) => !current)}
            >
              {filtersOpen ? "Chiudi filtri" : "Apri filtri"}
            </button>
          </div>

          {loading ? <div className="empty-panel">Caricamento catalogo...</div> : null}
          {error ? <p className="error-text">{error}</p> : null}
          {!loading && products.length === 0 ? (
            <div className="empty-panel">Nessun prodotto trovato.</div>
          ) : null}

          {!loading && products.length > 0 ? (
            <section className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default CatalogPage;
