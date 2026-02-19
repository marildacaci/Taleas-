import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { me, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!me)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (adminOnly && me.role !== "admin") {
    return <div style={{ padding: 20 }}>403 - Admin only</div>;
  }

  return children;
}
