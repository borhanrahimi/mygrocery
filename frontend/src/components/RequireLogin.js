import { Navigate } from "react-router-dom";

export function RequireLogin({ children }) {
  const userId = localStorage.getItem("userId");
  return userId ? children : <Navigate to="/auth" />;
}
