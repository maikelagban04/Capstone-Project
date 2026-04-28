import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { API_URL } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useTheme } from "../context/ThemeContext";
import kyronLogo from "../assets/Logo.png";

const Header = () => {
  const [expanded, setExpanded] = useState(false);
  const { auth, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => setExpanded((current) => !current);

  return (
    <header className="navbar navbar-expand-lg navbar-custom py-3">
      <div className="page-shell d-flex align-items-center justify-content-between gap-3">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-3 me-0">
          <div
            className={`brand-logo ${theme === "dark" ? "brand-logo--dark" : "brand-logo--light"}`}
            style={{ backgroundImage: `url(${kyronLogo})` }}
            aria-hidden="true"
          />
          <div>
            <strong className="mb-0">KyronTech</strong>
            <p className="mb-0 text-muted small">Componenti PC premium</p>
          </div>
        </Link>

        <button className="navbar-toggler" type="button" onClick={toggleMenu} aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse justify-content-between ${expanded ? "show" : ""}`}>
          <ul className="navbar-nav align-items-lg-center gap-2 mb-3 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" className="nav-link">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/catalog" className="nav-link">Catalog</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/cart" className="nav-link">Cart ({cartItems.length})</NavLink>
            </li>
            {auth ? (
              <>
                <li className="nav-item">
                  <NavLink to="/orders" className="nav-link">Orders</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/profile" className="nav-link">Profile</NavLink>
                </li>
              </>
            ) : null}
            {isAdmin ? (
              <li className="nav-item">
                <NavLink to="/admin" className="nav-link">Admin</NavLink>
              </li>
            ) : null}
          </ul>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button type="button" className="btn btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            {auth ? (
              <>
                <span className="nav-user text-muted">Hi, {auth.name}</span>
                <button type="button" className="btn btn-outline-secondary" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href={`${API_URL}/auth/google`} className="btn btn-outline-secondary">
                  Google
                </a>
                <Link to="/login" className="btn btn-outline-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
