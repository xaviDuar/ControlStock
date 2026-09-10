import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      const parsed = JSON.parse(saved);
      setToken(parsed.token);
      setUser(parsed.user);
    }
    setLoading(false);
  }, []);

  function login(tok, userData) {
    setToken(tok);
    setUser(userData);
    localStorage.setItem('auth', JSON.stringify({ token: tok, user: userData }));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
