/* eslint-disable react/prop-types */
import { createContext, useState, useEffect } from "react";
import { fetchUserPreferences } from "../../api/api";

export const UserPreferencesContext = createContext();

export function UserPreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState({ temp_unit: "Celsius" });

  useEffect(() => {
    const getUserPreferences = async () => {
      try {
        const response = await fetchUserPreferences();
        setPreferences(response.data);
      } catch (err) {
        console.error("Failed to fetch user preferences.", err);
      }
    };
    getUserPreferences();
  }, []);

  // Function to update the temperature unit
  const setTempUnit = (unit) => {
    setPreferences((prev) => ({ ...prev, temp_unit: unit }));
  };

  return (
    <UserPreferencesContext.Provider value={{ ...preferences, setTempUnit }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}
