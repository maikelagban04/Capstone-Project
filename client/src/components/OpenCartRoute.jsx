import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";

const OpenCartRoute = () => {
  const { openCart } = useCart();

  useEffect(() => {
    openCart();
  }, [openCart]);

  return <Navigate to="/catalog" replace />;
};

export default OpenCartRoute;
