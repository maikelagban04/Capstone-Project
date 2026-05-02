import { useContext } from "react";
import { WishlistContext } from "../context/wishlist-context";

export const useWishlist = () => useContext(WishlistContext);
