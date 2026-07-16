import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au chargement de l'app
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          // Ajuste cet endpoint selon ton backend Django (ex: /auth/users/me/ si tu utilises Djoser)
          const response = await api.get('/auth/profile/'); 
          setUser(response.data);
        } catch (error) {
          console.error("Session expirée ou invalide");
          logout(); // Nettoie le storage si le token est mort et que le refresh a échoué
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (credentials) => {
    try {
      // Ajuste l'endpoint selon ton backend (ex: /auth/jwt/create/ pour SimpleJWT)
      const response = await api.post('/auth/login/', credentials);
      
      const { access, refresh, user: userData } = response.data;

      // 1. Stocker les tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // 2. Mettre à jour l'état de l'utilisateur
      // Si ton API login ne renvoie pas les infos du user, tu peux faire un appel api.get('/auth/profile/') ici
      setUser(userData); 
      
      return { success: true };
    } catch (error) {
      console.error("Erreur de connexion:", error);
      return { 
        success: false, 
        message: error.response?.data?.detail || "Email ou mot de passe incorrect." 
      };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};