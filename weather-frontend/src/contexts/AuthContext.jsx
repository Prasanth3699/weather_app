/* eslint-disable no-useless-catch */
import { createContext, useState, useEffect } from "react";
import { register as apiRegister, login as apiLogin } from "../api/api";
import { useNavigate } from "react-router-dom";

// Create the Auth Context
export const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // User state
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  // Initialize authentication state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (accessToken && refreshToken && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // Authentication data loaded
  }, []);

  // Login Function
  const login = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      const { access, refresh } = response.data;

      // Save tokens and user info to localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      const userData = { username };
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      navigate("/dashboard");
    } catch (error) {
      throw error; // Rethrow to handle error at the call site
    }
  };

  // Register Function
  const registerUser = async (userData) => {
    try {
      await apiRegister(userData);
      // Optionally, auto-login after registration
      await login(userData.username, userData.password);
    } catch (error) {
      throw error; // Rethrow to handle error at the call site
    }
  };

  // Logout Function
  const logout = () => {
    // Clear tokens and user info from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register: registerUser, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
