import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import logoDark from "../assets/logo-dark-transparent.png";
import logoLight from "../assets/logo-light-clean.png";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const Header = () => {
  const [open, setOpen] = useState(false);
  const { auth, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();
  const { theme, toggleTheme } = useTheme();

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="page-shell site-header__inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <img src={theme === "dark" ? logoDark : logoLight} alt="KyronTech" className="brand__logo" />
        </Link>

        <button
          type="button"
          className="site-header__toggle d-xl-none"
          onClick={() => setOpen((current) => !current)}
          aria-label="Open menu"
        >
          <span />
          <span />
        </button>

        <div className={`site-header__panel ${open ? "is-open" : ""}`}>
          <nav className="site-nav">
            <NavLink to="/" onClick={closeMenu}>Home</NavLink>
            <NavLink to="/catalog" onClick={closeMenu}>Catalogo</NavLink>
            <NavLink to="/cart" onClick={closeMenu}>
              Carrello
              <span className="site-nav__count">{cartItems.length}</span>
            </NavLink>
            {auth ? <NavLink to="/orders" onClick={closeMenu}>Ordini</NavLink> : null}
            {auth ? <NavLink to="/profile" onClick={closeMenu}>Profilo</NavLink> : null}
            {isAdmin ? <NavLink to="/admin" onClick={closeMenu}>Dashboard</NavLink> : null}
          </nav>

          <div className="site-header__actions">
            <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              <span className={`theme-toggle__dot ${theme === "dark" ? "is-dark" : ""}`} />
              <span>{theme === "dark" ? "Dark" : "Light"}</span>
            </button>

            {auth ? (
              <>
                <span className="site-header__user">{auth.name}</span>
                <button type="button" className="btn btn-outline-secondary btn-shell" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-secondary btn-shell" onClick={closeMenu}>
                  Accedi
                </Link>
                <Link to="/register" className="btn btn-primary btn-shell btn-shell--primary" onClick={closeMenu}>
                  Registrati
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
