import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer py-5">
      <div className="page-shell footer-grid">
        <div>
          <Link to="/" className="footer-brand">
            <span>DSP</span>
            <strong>Dropship Store Pro</strong>
          </Link>
          <p>Premium hardware experience for builders, gamers and system integrators.</p>
        </div>

        <div>
          <h4>Quick links</h4>
          <ul className="footer-list">
            <li><Link to="/catalog">Catalog</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/profile">Account</Link></li>
          </ul>
        </div>

        <div>
          <h4>Support</h4>
          <ul className="footer-list">
            <li><a href="mailto:help@kyrontech.com">help@kyrontech.com</a></li>
            <li><a href="tel:+39000000000">+39 000 000 000</a></li>
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul className="footer-list">
            <li><Link to="/">About us</Link></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} Dropship Store Pro. Styled for premium performance.</small>
      </div>
    </footer>
  );
};

export default Footer;
