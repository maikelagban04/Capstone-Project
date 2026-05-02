import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { UserIcon } from "../components/icons";

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const UsersAdminPage = () => {
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/users", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setUsers(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.name, user.email, user.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [users, search]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const admins = users.filter((user) => user.role === "admin").length;
    const totalRevenue = users.reduce(
      (sum, user) => sum + Number(user.totalSpent || 0),
      0,
    );
    const totalOrders = users.reduce(
      (sum, user) => sum + Number(user.ordersCount || 0),
      0,
    );
    return {
      totalUsers,
      admins,
      clients: totalUsers - admins,
      totalRevenue,
      totalOrders,
    };
  }, [users]);

  return (
    <div className="page-stack">
      <section className="section-head">
        <div>
          <span className="section-kicker">Admin</span>
          <h1>Utenti</h1>
        </div>
      </section>

      <section className="info-card-grid">
        <article className="info-card">
          <small>Utenti totali</small>
          <strong>{stats.totalUsers}</strong>
        </article>
        <article className="info-card">
          <small>Clienti</small>
          <strong>{stats.clients}</strong>
        </article>
        <article className="info-card">
          <small>Ordini totali</small>
          <strong>{stats.totalOrders}</strong>
        </article>
        <article className="info-card">
          <small>Fatturato</small>
          <strong>€ {stats.totalRevenue.toFixed(2)}</strong>
        </article>
      </section>

      <div className="catalog-toolbar">
        <input
          type="search"
          className="form-control"
          placeholder="Cerca per nome, email o ruolo..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ maxWidth: 360 }}
        />
        <span>{filtered.length} risultati</span>
      </div>

      {loading ? <div className="empty-panel">Caricamento utenti...</div> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!loading && !error && filtered.length === 0 ? (
        <div className="empty-panel">
          <strong>Nessun utente trovato.</strong>
        </div>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <section className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Utente</th>
                <th>Ruolo</th>
                <th>Registrato</th>
                <th className="num">Ordini</th>
                <th className="num">Speso</th>
                <th>Ultimo ordine</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="users-table__identity">
                      <div className="users-table__avatar" aria-hidden="true">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" />
                        ) : (
                          <UserIcon />
                        )}
                      </div>
                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`role-pill ${user.role === "admin" ? "is-admin" : "is-user"}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td className="num">{user.ordersCount}</td>
                  <td className="num">€ {Number(user.totalSpent || 0).toFixed(2)}</td>
                  <td>{formatDate(user.lastOrderAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
};

export default UsersAdminPage;
