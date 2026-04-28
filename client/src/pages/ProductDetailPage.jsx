import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useCart } from "../hooks/useCart";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/products/${id}`);
        setProduct(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <section className="detail-layout card">
      <img src={product.image} alt={product.title} className="detail-layout__image" />
      <div className="stack-md">
        <span className="pill">{product.componentType}</span>
        <h1>{product.title}</h1>
        <div className="product-header-info">
          <p className="brand-model">
            <strong>{product.brand}</strong> {product.model}
          </p>
        </div>
        <p>{product.description}</p>

        {/* Specifiche tecniche */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="specifications-section">
            <h2>Specifications</h2>
            <dl className="specs-grid">
              {product.specifications.cores && (
                <>
                  <dt>Cores:</dt>
                  <dd>{product.specifications.cores}</dd>
                </>
              )}
              {product.specifications.frequency && (
                <>
                  <dt>Frequency:</dt>
                  <dd>{product.specifications.frequency}</dd>
                </>
              )}
              {product.specifications.memory && (
                <>
                  <dt>Memory:</dt>
                  <dd>{product.specifications.memory}</dd>
                </>
              )}
              {product.specifications.capacity && (
                <>
                  <dt>Capacity:</dt>
                  <dd>{product.specifications.capacity}</dd>
                </>
              )}
              {product.specifications.speed && (
                <>
                  <dt>Speed:</dt>
                  <dd>{product.specifications.speed}</dd>
                </>
              )}
              {product.specifications.power && (
                <>
                  <dt>Power:</dt>
                  <dd>{product.specifications.power}</dd>
                </>
              )}
            </dl>
          </div>
        )}

        {/* Compatibilità */}
        {product.compatibility && Object.keys(product.compatibility).length > 0 && (
          <div className="compatibility-section">
            <h2>Compatibility</h2>
            <dl className="specs-grid">
              {product.compatibility.socket && (
                <>
                  <dt>Socket:</dt>
                  <dd>{product.compatibility.socket}</dd>
                </>
              )}
              {product.compatibility.chipset && (
                <>
                  <dt>Chipset:</dt>
                  <dd>{product.compatibility.chipset}</dd>
                </>
              )}
              {product.compatibility.interface && (
                <>
                  <dt>Interface:</dt>
                  <dd>{product.compatibility.interface}</dd>
                </>
              )}
              {product.compatibility.formFactor && (
                <>
                  <dt>Form Factor:</dt>
                  <dd>{product.compatibility.formFactor}</dd>
                </>
              )}
              {product.compatibility.memoryType && (
                <>
                  <dt>Memory Type:</dt>
                  <dd>{product.compatibility.memoryType}</dd>
                </>
              )}
              {product.compatibility.wattage && (
                <>
                  <dt>Wattage:</dt>
                  <dd>{product.compatibility.wattage}</dd>
                </>
              )}
              {product.compatibility.tdp && (
                <>
                  <dt>TDP:</dt>
                  <dd>{product.compatibility.tdp}</dd>
                </>
              )}
            </dl>
          </div>
        )}

        <div className="detail-metrics">
          <div>
            <span>Base price</span>
            <strong>EUR {product.priceBase.toFixed(2)}</strong>
          </div>
          <div>
            <span>Markup</span>
            <strong>{product.markup}%</strong>
          </div>
          <div>
            <span>Final price</span>
            <strong>EUR {product.finalPrice.toFixed(2)}</strong>
          </div>
          {product.stock !== undefined && (
            <div>
              <span>In Stock</span>
              <strong>{product.stock > 0 ? `${product.stock} units` : "Out of Stock"}</strong>
            </div>
          )}
        </div>
        <button
          type="button"
          className="button"
          onClick={() => addToCart(product)}
          disabled={!product.inStock}
        >
          {product.inStock ? "Add to cart" : "Out of Stock"}
        </button>
      </div>
    </section>
  );
};

export default ProductDetailPage;
