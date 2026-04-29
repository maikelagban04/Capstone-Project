import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import logoDark from "../assets/logo-dark.png";
import logoLight from "../assets/logo-light.png";

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="footer">
      <div className="page-shell footer-shell">
        <div className="footer-brand-block">
          <img src={theme === "dark" ? logoDark : logoLight} alt="KyronTech" className="footer-logo" />
          <p>
            KyronTech e-commerce specializzato in componenti PC premium per gaming rig, workstation e build ad
            alte prestazioni.
          </p>
        </div>

        <div>
          <h4>Shop</h4>
          <ul className="footer-list">
            <li><Link to="/catalog">Catalogo</Link></li>
            <li><Link to="/cart">Carrello</Link></li>
            <li><Link to="/checkout">Checkout</Link></li>
          </ul>
        </div>

        <div>
          <h4>Account</h4>
          <ul className="footer-list">
            <li><Link to="/login">Accedi</Link></li>
            <li><Link to="/register">Registrati</Link></li>
            <li><Link to="/orders">Ordini</Link></li>
          </ul>
        </div>

        <div>
          <h4>Supporto</h4>
          <ul className="footer-list">
            <li><a href="mailto:help@kyrontech.com">help@kyrontech.com</a></li>
            <li><a href="tel:+39000000000">+39 000 000 000</a></li>
            <li>Spedizioni rapide in tutta Europa</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="page-shell footer-bottom__inner">
          <small>© {new Date().getFullYear()} KyronTech. Engineered for builders.</small>
          <small>Design responsive light/dark ottimizzato per conversione.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
