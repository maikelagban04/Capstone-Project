import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { API_URL } from "../api/client";
import { useTheme } from "../context/ThemeContext";
import logoDark from "../assets/logo-dark.png";
import logoLight from "../assets/logo-light.png";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const Header = () => {
  const [expanded, setExpanded] = useState(false);
  const { auth, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();
  const { theme, toggleTheme } = useTheme();

  const closeMenu = () => setExpanded(false);
  const brandLogo = theme === "dark" ? logoDark : logoLight;

  return (
    <header className="navbar navbar-expand-xl navbar-custom">
      <div className="page-shell nav-shell">
        <Link to="/" className="navbar-brand brand-lockup me-0" onClick={closeMenu}>
          <div className="brand-logo-wrap">
            <img src={brandLogo} alt="KyronTech" className="brand-logo-image" />
          </div>
          <div className="brand-copy">
            <strong>KyronTech</strong>
            <span>Premium PC Components</span>
          </div>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse nav-panel ${expanded ? "show" : ""}`}>
          <ul className="navbar-nav nav-links align-items-xl-center mb-3 mb-xl-0">
            <li className="nav-item">
              <NavLink to="/" className="nav-link" onClick={closeMenu}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/catalog" className="nav-link" onClick={closeMenu}>
                Catalog
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/cart" className="nav-link" onClick={closeMenu}>
                Cart
                <span className="nav-count">{cartItems.length}</span>
              </NavLink>
            </li>
            {auth ? (
              <>
                <li className="nav-item">
                  <NavLink to="/orders" className="nav-link" onClick={closeMenu}>
                    Orders
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/profile" className="nav-link" onClick={closeMenu}>
                    Profile
                  </NavLink>
                </li>
              </>
            ) : null}
            {isAdmin ? (
              <li className="nav-item">
                <NavLink to="/admin" className="nav-link" onClick={closeMenu}>
                  Dashboard
                </NavLink>
              </li>
            ) : null}
          </ul>

          <div className="nav-actions">
            <button type="button" className="theme-switch" onClick={toggleTheme} aria-label="Toggle theme">
              <span className={`theme-switch__thumb ${theme === "dark" ? "is-dark" : ""}`} />
              <span className="theme-switch__label">{theme === "light" ? "Light" : "Dark"}</span>
            </button>

            {auth ? (
              <>
                <div className="nav-user-chip">
                  <small>Logged in</small>
                  <strong>{auth.name}</strong>
                </div>
                <button type="button" className="btn btn-outline-secondary btn-premium-outline" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href={`${API_URL}/auth/google`} className="btn btn-outline-secondary btn-premium-outline">
                  Google
                </a>
                <Link to="/login" className="btn btn-outline-secondary btn-premium-outline" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-premium" onClick={closeMenu}>
                  Build your account
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
