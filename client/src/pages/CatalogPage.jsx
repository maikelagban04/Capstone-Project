import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import ProductCard from "../components/ProductCard";

const stockOptions = [
  { label: "Tutti", value: "all" },
  { label: "Disponibili", value: "true" },
  { label: "Esauriti", value: "false" },
];

const CatalogPage = () => {
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
    () => [selectedComponent, selectedBrand, minPrice, maxPrice, inStock !== "all" ? inStock : ""].filter(Boolean).length,
    [selectedBrand, selectedComponent, minPrice, maxPrice, inStock],
  );

  const handleClearFilters = () => {
    setSearch("");
    setSelectedComponent("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setInStock("all");
  };

  return (
    <div className="stack-2xl">
      <section className="catalog-hero">
        <div className="catalog-hero__content">
          <span className="eyebrow">Catalogo premium</span>
          <h1>Trova componenti PC con un'esperienza di filtro davvero moderna.</h1>
          <p>
            Ricerca veloce, selezione per brand e component type, controllo stock e fascia prezzo: tutto ottimizzato
            per aiutarti a comprare meglio.
          </p>
        </div>

        <div className="catalog-search-card glass-panel">
          <label htmlFor="catalog-search" className="form-label">Cerca nel catalogo</label>
          <input
            id="catalog-search"
            type="search"
            className="form-control"
            placeholder="CPU, GPU, RAM, brand o modello"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="catalog-search-card__meta">
            <span>{filterOptions.totalProducts} prodotti in archivio</span>
            <span>{products.length} risultati visibili</span>
          </div>
        </div>
      </section>

      <section className="catalog-layout">
        <aside className={`catalog-sidebar ${showFilters ? "is-open" : ""}`}>
          <div className="catalog-sidebar__header">
            <div>
              <h2>Filtri</h2>
              <p>{activeFilters} attivi</p>
            </div>
            <button type="button" className="btn btn-sm btn-outline-secondary btn-premium-outline" onClick={handleClearFilters}>
              Reset
            </button>
          </div>

          <div className="filter-group">
            <h3>Tipo componente</h3>
            <div className="filter-chip-list">
              <button
                type="button"
                className={`filter-chip ${selectedComponent === "" ? "is-active" : ""}`}
                onClick={() => setSelectedComponent("")}
              >
                Tutti
              </button>
              {filterOptions.componentTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`filter-chip ${selectedComponent === type ? "is-active" : ""}`}
                  onClick={() => setSelectedComponent(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Brand</h3>
            <select className="form-select" value={selectedBrand} onChange={(event) => setSelectedBrand(event.target.value)}>
              <option value="">Tutti i brand</option>
              {filterOptions.brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <h3>Prezzo</h3>
            <div className="price-grid">
              <input
                type="number"
                className="form-control"
                placeholder={`Da €${Math.floor(filterOptions.minPrice)}`}
                value={minPrice}
                min={Math.floor(filterOptions.minPrice)}
                max={Math.ceil(filterOptions.maxPrice)}
                onChange={(event) => setMinPrice(event.target.value)}
              />
              <input
                type="number"
                className="form-control"
                placeholder={`A €${Math.ceil(filterOptions.maxPrice)}`}
                value={maxPrice}
                min={Math.floor(filterOptions.minPrice)}
                max={Math.ceil(filterOptions.maxPrice)}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <h3>Disponibilità</h3>
            <div className="filter-chip-list">
              {stockOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`filter-chip ${inStock === option.value ? "is-active" : ""}`}
                  onClick={() => setInStock(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="catalog-results">
          <div className="catalog-results__toolbar">
            <div>
              <span className="eyebrow">Risultati</span>
              <h2>{products.length} prodotti selezionati</h2>
            </div>
            <button
              type="button"
              className="btn btn-outline-secondary btn-premium-outline d-lg-none"
              onClick={() => setShowFilters((current) => !current)}
            >
              {showFilters ? "Chiudi filtri" : "Apri filtri"}
            </button>
          </div>

          {loading ? <div className="empty-showcase">Sto caricando il catalogo...</div> : null}
          {error ? <p className="error-text">{error}</p> : null}

          {!loading && products.length === 0 ? (
            <div className="empty-showcase">Nessun prodotto trovato. Prova a cambiare filtri o ricerca.</div>
          ) : null}

          {!loading && products.length > 0 ? (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </div>
  );
};

export default CatalogPage;
