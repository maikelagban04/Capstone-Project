import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import logoDark from "../assets/logo-dark-transparent.png";
import logoLight from "../assets/logo-light-clean.png";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import {
  BoxIcon,
  CartIcon,
  ChevronDownIcon,
  HeartIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "./icons";

const CATEGORIES = [
  { key: "CPU", label: "Processori" },
  { key: "GPU", label: "Schede video" },
  { key: "Motherboard", label: "Schede madri" },
  { key: "RAM", label: "Memorie RAM" },
  { key: "SSD", label: "Storage SSD" },
  { key: "PSU", label: "Alimentatori" },
  { key: "Cooling", label: "Raffreddamento" },
  { key: "Case", label: "Case" },
];

const Header = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { auth, isAdmin, isSuperAdmin, logout } = useAuth();
  const { cartItems, openCart } = useCart();
  const wishlist = useWishlist();
  const wishlistCount = wishlist?.items?.length || 0;
  const { theme, toggleTheme } = useTheme();

  const closeMenu = () => {
    setOpen(false);
    setCategoriesOpen(false);
  };

  const goToCategory = (componentType) => {
    closeMenu();
    navigate(`/catalog?componentType=${encodeURIComponent(componentType)}`);
  };

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
            <div
              className="site-nav__dropdown"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                type="button"
                className="site-nav__dropdown-trigger"
                onClick={() => setCategoriesOpen((prev) => !prev)}
                aria-expanded={categoriesOpen}
              >
                Categorie <ChevronDownIcon />
              </button>
              {categoriesOpen ? (
                <div className="site-nav__dropdown-panel">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => goToCategory(cat.key)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <NavLink to="/catalog" onClick={closeMenu}>Catalogo</NavLink>
            <NavLink to="/pc-builder" onClick={closeMenu}>PC Builder</NavLink>
            <NavLink to="/support" onClick={closeMenu}>Supporto</NavLink>
            {isAdmin ? <NavLink to="/admin" end onClick={closeMenu}>Dashboard</NavLink> : null}
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
              className="icon-btn icon-btn--wishlist"
              onClick={() => {
                closeMenu();
                navigate(auth ? "/wishlist" : "/login");
              }}
              aria-label="Wishlist"
              title="Wishlist"
            >
              <HeartIcon filled={wishlistCount > 0} />
              {wishlistCount > 0 ? (
                <span className="icon-btn__badge">{wishlistCount}</span>
              ) : null}
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
