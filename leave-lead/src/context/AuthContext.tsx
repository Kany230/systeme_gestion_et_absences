import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/data/users"; 
import { authService } from "@/api/authService";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Session invalide", e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, remember = false) => {
    // 1. Authentification (Retourne maintenant { token, user })
    const authData = await authService.login(email, password);
    const { token, user: userData } = authData;

    // 2. Stockage cohérent
    setUser(userData);
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("auth_user", JSON.stringify(userData));
    // Le token est déjà stocké par authService.login via localStorage.setItem('token', ...)
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      // On nettoie le state même si l'appel API échoue
      setUser(null);
      localStorage.removeItem("auth_user");
      sessionStorage.removeItem("auth_user");
    }
  };

  
  return (
    <Ctx.Provider value={{ user, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
};

// Ajoute ceci tout en bas de ton fichier :

export const useAuth = () => {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}