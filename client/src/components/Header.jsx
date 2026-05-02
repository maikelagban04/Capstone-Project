import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import logoDark from "../assets/logo-dark-transparent.png";
import logoLight from "../assets/logo-light-clean.png";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { BoxIcon, CartIcon, MoonIcon, SunIcon, UserIcon } from "./icons";

const Header = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { auth, isAdmin, isSuperAdmin, logout } = useAuth();
  const { cartItems, openCart } = useCart();
  const { theme, toggleTheme } = useTheme();

  const closeMenu = () => setOpen(false);

  const handleProfileClick = () => {
    closeMenu();
    navigate(auth ? "/profile" : "/login");
  };

  const handleOrdersClick = () => {
    closeMenu();
    navigate(auth ? "/orders" : "/login");
  };

  const handleCartClick = () => {
    closeMenu();
    openCart();
  };

  return (
    <header className="site-header">
      <div className="page-shell site-header__inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="KyronTech"
            className="brand__logo"
          />
        </Link>

        <button
          type="button"
          className="site-header__toggle"
          onClick={() => setOpen((current) => !current)}
          aria-label="Apri menu"
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`site-header__panel ${open ? "is-open" : ""}`}>
          <nav className="site-nav">
            <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
            <NavLink to="/catalog" onClick={closeMenu}>Catalogo</NavLink>
            {isAdmin ? <NavLink to="/admin" onClick={closeMenu}>Dashboard</NavLink> : null}
            {isAdmin ? <NavLink to="/admin/users" onClick={closeMenu}>Utenti</NavLink> : null}
            {isSuperAdmin ? <NavLink to="/admin/inventory" onClick={closeMenu}>Inventario</NavLink> : null}
          </nav>

          <div className="site-header__actions">
            <button
              type="button"
              className="icon-btn theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"}
              title={theme === "dark" ? "Tema chiaro" : "Tema scuro"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={handleOrdersClick}
              aria-label="Ordini"
              title="Ordini"
            >
              <BoxIcon />
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={handleProfileClick}
              aria-label={auth ? "Profilo" : "Accedi"}
              title={auth ? auth.name : "Accedi"}
            >
              <UserIcon />
            </button>

            <button
              type="button"
              className="cart-pill"
              onClick={handleCartClick}
              aria-label="Apri carrello"
            >
              <CartIcon />
              <span>Cart</span>
              {cartItems.length > 0 ? (
                <span className="cart-pill__count">{cartItems.length}</span>
              ) : null}
            </button>

            {auth ? (
              <button
                type="button"
                className="btn-shell"
                onClick={() => {
                  closeMenu();
                  logout();
                }}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/register"
                className="btn-shell btn-shell--primary"
                onClick={closeMenu}
              >
                Registrati
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
