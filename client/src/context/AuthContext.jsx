import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { AuthContext } from "./auth-context";
const STORAGE_KEY = "dropship-store-pro-auth";

const SUPER_ADMIN_EMAIL = (
  import.meta.env.VITE_SUPER_ADMIN_EMAIL || "maikelagban04@gmail.com"
)
  .trim()
  .toLowerCase();

const computeSuperAdmin = (user) => {
  if (!user || user.role !== "admin") return false;
  return (user.email || "").trim().toLowerCase() === SUPER_ADMIN_EMAIL;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      setAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!auth?.token) {
      return null;
    }

    const profile = await apiRequest("/auth/me", {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    const nextAuth = { ...auth, ...profile };
    setAuth(nextAuth);
    return nextAuth;
  };

  const logout = () => setAuth(null);

  const completeOAuthLogin = async (token) => {
    setLoading(true);
    try {
      const profile = await apiRequest("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const nextAuth = {
        ...profile,
        token,
      };

      setAuth(nextAuth);
      return nextAuth;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        loading,
        isAuthenticated: Boolean(auth?.token),
        isAdmin: auth?.role === "admin",
        isSuperAdmin: computeSuperAdmin(auth),
        login,
        register,
        refreshProfile,
        completeOAuthLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
