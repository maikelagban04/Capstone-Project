import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="page-shell site-footer__inner">
        <div className="site-footer__intro">
          <strong>KyronTech</strong>
          <p>
            Ecommerce dedicato a componenti PC, build da gaming, workstation e hardware selezionato per qualità,
            compatibilità e chiarezza d'acquisto.
          </p>
        </div>

        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/catalog">Catalogo</Link></li>
            <li><Link to="/checkout">Checkout</Link></li>
          </ul>
        </div>

        <div>
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Accedi</Link></li>
            <li><Link to="/register">Registrati</Link></li>
            <li><Link to="/orders">Ordini</Link></li>
          </ul>
        </div>

        <div>
          <h4>Supporto</h4>
          <ul>
            <li><a href="mailto:help@kyrontech.com">help@kyrontech.com</a></li>
            <li><a href="tel:+39000000000">+39 000 000 000</a></li>
            <li>Spedizioni rapide e UI mobile-first</li>
          </ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <div className="page-shell">
          <small>© {new Date().getFullYear()} KyronTech. Modern hardware ecommerce.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
