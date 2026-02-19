import React, { createContext, useContext, useEffect, useState } from "react";
import { logout } from "./authClient";
import { fetchMe } from "../api/me";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null); 
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetchMe();
      const user = res?.data?.user || null;
      setMe(user);
      return user;
    } catch {
      setMe(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await logout();
    setMe(null);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthCtx.Provider value={{ me, loading, refresh, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
