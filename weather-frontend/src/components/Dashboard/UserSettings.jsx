import { useContext } from "react";
import { UserPreferencesContext } from "../../contexts/UserPreferencesContext";

function UserSettings() {
  const { temp_unit, setTempUnit } = useContext(UserPreferencesContext);

  return (
    <div className="max-w-sm mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-center mb-4">
        Temperature Unit
      </h2>
      <div className="flex justify-around items-center">
        <button
          className={`px-4 py-2 rounded ${
            temp_unit === "Celsius" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTempUnit("Celsius")}
        >
          Celsius (°C)
        </button>

        <button
          className={`px-4 py-2 rounded ${
            temp_unit === "Fahrenheit"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setTempUnit("Fahrenheit")}
        >
          Fahrenheit (°F)
        </button>
      </div>
    </div>
  );
}

export default UserSettings;
