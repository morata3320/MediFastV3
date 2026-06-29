import { Navigate, useLocation } from "react-router-dom";

import { getToken } from "../modelo/api.js";

function roleOf(user) {
  return user?.role || user?.rol;
}

export function ProtectedRoute({ user, children }) {
  const location = useLocation();
  if (!getToken() || !user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function AdminRoute({ user, children }) {
  const location = useLocation();
  if (!getToken() || !user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roleOf(user) !== "admin") return <Navigate to="/no-autorizado" replace />;
  return children;
}
