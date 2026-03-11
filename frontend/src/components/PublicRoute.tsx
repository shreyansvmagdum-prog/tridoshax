import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export const PublicRoute = ({ children }: any) => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};