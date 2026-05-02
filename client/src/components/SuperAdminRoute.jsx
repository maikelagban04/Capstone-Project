import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const SuperAdminRoute = ({ children }) => {
  const { isAuthenticated, isSuperAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default SuperAdminRoute;
