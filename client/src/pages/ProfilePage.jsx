import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { BoxIcon, LogoutIcon, SettingsIcon, UserIcon } from "../components/icons";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="page-stack">
      <section className="section-head">
        <div>
          <span className="section-kicker">Account</span>
          <h1>Il mio account</h1>
        </div>
      </section>

      <article className="account-card">
        <div className="account-avatar">
          <UserIcon />
        </div>
        <div className="account-card__info">
          <strong>{auth?.name || "Utente"}</strong>
          <span>{auth?.email}</span>
        </div>
      </article>

      <section className="account-actions">
        <Link to="/orders" className="account-tile">
          <BoxIcon />
          <span>Ordini</span>
        </Link>
        <Link to="/profile" className="account-tile">
          <SettingsIcon />
          <span>Impostazioni</span>
        </Link>
        <button type="button" className="account-tile" onClick={handleLogout}>
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </section>
    </div>
  );
};

export default ProfilePage;
