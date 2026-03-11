import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export const ProtectedRoute = ({ children }: any) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};