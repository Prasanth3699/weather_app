import { useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";
import { UserPreferencesContext } from "../contexts/UserPreferencesContext";
import { motion } from "framer-motion"; // Import Framer Motion
import ForecastList from "./ForecastList"; // Import the card-based forecast list

/**
 * Component to display forecast data in card layout.
 * @param {Array} forecast - Array of forecast data objects.
 */
function Forecast({ forecast }) {
  const preferences = useContext(UserPreferencesContext);
  const [hourlyForecast, setHourlyForecast] = useState([]);

  /**
   * Convert temperature from Celsius to Fahrenheit if needed.
   * @param {number} tempCelsius - Temperature in Celsius.
   * @returns {number} Temperature in the preferred unit.
   */
  const convertTemperature = (tempCelsius) =>
    preferences.temp_unit === "Fahrenheit"
      ? (tempCelsius * 9) / 5 + 32
      : tempCelsius;

  /**
   * Process forecast data on component mount or when forecast prop changes.
   */
  useEffect(() => {
    if (forecast && Array.isArray(forecast)) {
      const processedForecast = forecast.map((entry) => ({
        ...entry,
        temp: convertTemperature(entry.temp),
        feels_like: convertTemperature(entry.feels_like),
      }));
      setHourlyForecast(processedForecast);
    }
  }, [forecast, preferences.temp_unit]);

  if (!hourlyForecast.length) {
    return (
      <motion.div
        className="text-center text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        No forecast data available.
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h2 className="text-center text-xl font-semibold text-gray-800 mb-6">
        Hourly Forecast
      </h2>
      {/* Forecast List rendered as cards */}
      <ForecastList forecast={hourlyForecast} />
    </motion.div>
  );
}

Forecast.propTypes = {
  forecast: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
      temp: PropTypes.number.isRequired,
      feels_like: PropTypes.number.isRequired,
      humidity: PropTypes.number.isRequired,
      wind_speed: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default Forecast;
