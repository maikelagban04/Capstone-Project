import { Link, NavLink } from "react-router-dom";
import { API_URL } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const { auth, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link to="/" className="brand">
          <span className="brand__badge">DSP</span>
          <div>
            <strong>Dropship Store Pro</strong>
            <p>Commerce control for fast-moving catalogs</p>
          </div>
        </Link>

        <nav className="nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/cart">Cart ({cartItems.length})</NavLink>
          {auth ? <NavLink to="/orders">Orders</NavLink> : null}
          {isAdmin ? <NavLink to="/admin">Admin</NavLink> : null}
          {auth ? <NavLink to="/profile">Profile</NavLink> : null}
        </nav>

        <div className="topbar__actions">
          <button
            type="button"
            className="button button--ghost theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {auth ? (
            <>
              <span className="welcome">Hi, {auth.name}</span>
              <button type="button" className="button button--ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <a href={`${API_URL}/auth/google`} className="button button--ghost button--google">
                Google
              </a>
              <Link to="/login" className="button button--ghost">
                Login
              </Link>
              <Link to="/register" className="button">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
