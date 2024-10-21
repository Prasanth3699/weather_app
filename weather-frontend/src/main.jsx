import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./components/contexts/AuthContext";
import { UserPreferencesProvider } from "./components/contexts/UserPreferencesContext";
import "./index.css";
import "./charts";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserPreferencesProvider>
          <App />
        </UserPreferencesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
