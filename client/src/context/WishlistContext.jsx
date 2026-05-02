import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { WishlistContext } from "./wishlist-context";

export const WishlistProvider = ({ children }) => {
  const { auth, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeader = useMemo(
    () => (auth?.token ? { Authorization: `Bearer ${auth.token}` } : null),
    [auth?.token],
  );

  const loadWishlist = useCallback(async () => {
    if (!authHeader) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const data = await apiRequest("/users/me/wishlist", { headers: authHeader });
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      // Token scaduto o 401: svuota silenziosamente.
      if (error?.status === 401) setItems([]);
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, loadWishlist]);

  const isInWishlist = useCallback(
    (productId) => items.some((item) => String(item._id) === String(productId)),
    [items],
  );

  const addToWishlist = useCallback(
    async (productId) => {
      if (!authHeader) return;
      const updated = await apiRequest(`/users/me/wishlist/${productId}`, {
        method: "POST",
        headers: authHeader,
      });
      setItems(Array.isArray(updated) ? updated : []);
    },
    [authHeader],
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!authHeader) return;
      const updated = await apiRequest(`/users/me/wishlist/${productId}`, {
        method: "DELETE",
        headers: authHeader,
      });
      setItems(Array.isArray(updated) ? updated : []);
    },
    [authHeader],
  );

  const toggleWishlist = useCallback(
    async (productId) => {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist],
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        reload: loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
