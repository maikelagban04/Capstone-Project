import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { BoxIcon, HeartIcon, LogoutIcon, SettingsIcon, TrashIcon, UserIcon } from "../components/icons";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { auth, isAdmin, logout } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Eliminare definitivamente l'account? Questa azione rimuove anche lo storico degli ordini e non può essere annullata.",
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");
      await apiRequest("/users/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      logout();
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
      setDeleting(false);
    }
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
        <Link to="/wishlist" className="account-tile">
          <HeartIcon />
          <span>Wishlist</span>
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

      {!isAdmin ? (
        <section className="account-danger">
          <div>
            <h3>Elimina account</h3>
            <p>
              Questa azione rimuove il tuo profilo e tutta la cronologia ordini. Non potrà essere annullata.
            </p>
            {error ? <p className="error-text">{error}</p> : null}
          </div>
          <button
            type="button"
            className="btn-shell account-danger__btn"
            onClick={handleDeleteAccount}
            disabled={deleting}
          >
            <TrashIcon />
            <span>{deleting ? "Eliminazione..." : "Elimina account"}</span>
          </button>
        </section>
      ) : null}
    </div>
  );
};

export default ProfilePage;
