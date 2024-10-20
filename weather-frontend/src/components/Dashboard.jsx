import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion"; // Import Framer Motion
import DailySummaries from "./DailySummaries";
import HistoricalTrends from "./HistoricalTrends";
import Alerts from "./Alerts";
import Forecast from "./Forecast";
import {
  fetchCities,
  fetchDailySummariesByCity,
  fetchLatestWeatherDataByCity,
  fetchAlertsByCity,
  fetchForecastDataByCity,
} from "../api/api";
import { UserPreferencesContext } from "../contexts/UserPreferencesContext";
// import { WiDaySunny, WiCloudy } from "react-icons/wi";
import windIcon from "../assets/wind.png";
import conditionIcon from "../assets/condition.png";
import temperatureFeelsLikeIcon from "../assets/temperature_feels_like.png";
import humidityIcon from "../assets/humidity.png";
import rainIcon from "../assets/rain.png";
import clearIcon from "../assets/clear.png";
import dayMistIcon from "../assets/day_mist.png";
import snowIcon from "../assets/snow.png";
import hazeIcon from "../assets/haze.png";
import sunnyIcon from "../assets/sunny.png";
import drizzleRainIcon from "../assets/drizzle_rain.png";
import thunderstormIcon from "../assets/thunderstorm.png";

function Dashboard() {
  const preferences = useContext(UserPreferencesContext);
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState(
    () => JSON.parse(localStorage.getItem("selectedCityId")) || null // Load from local storage
  );
  const [cityData, setCityData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch all available cities from the API.
   */
  const getCities = async () => {
    try {
      const response = await fetchCities();
      setCities(response.data);
      if (response.data.length > 0 && !selectedCityId) {
        setSelectedCityId(response.data[0].id); // Set default city if not already selected
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
      setError("Failed to fetch cities.");
    }
  };

  /**
   * Fetch weather-related data for a specific city.
   * @param {number} cityId - The ID of the city to fetch data for.
   */
  const getCityData = async (cityId) => {
    try {
      const { data: latestWeather } = await fetchLatestWeatherDataByCity(
        cityId
      );

      const [dailyResponse, alertsResponse, forecastResponse] =
        await Promise.all([
          fetchDailySummariesByCity(cityId),
          fetchAlertsByCity(cityId),
          fetchForecastDataByCity(cityId),
        ]);

      const dailySummaries = Array.isArray(dailyResponse.data)
        ? dailyResponse.data
        : dailyResponse.data.results || [];

      const alerts = Array.isArray(alertsResponse.data)
        ? alertsResponse.data
        : alertsResponse.data.results || [];

      const forecast = Array.isArray(forecastResponse.data)
        ? forecastResponse.data
        : forecastResponse.data.results || [];

      setCityData((prevData) => ({
        ...prevData,
        [cityId]: {
          dailySummaries,
          latestWeather,
          alerts,
          forecast,
        },
      }));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching city data:", err);
      setError("Failed to fetch city data.");
      setLoading(false);
    }
  };

  // Initial fetch for cities
  useEffect(() => {
    getCities();
  }, []);

  // Fetch city data when selectedCityId changes and set up polling
  useEffect(() => {
    if (selectedCityId !== null) {
      setLoading(true);
      getCityData(selectedCityId);

      // Polling every 5 minutes for real-time updates
      const interval = setInterval(() => {
        getCityData(selectedCityId);
      }, 300000); // 300,000 ms = 5 minutes

      return () => clearInterval(interval);
    }
  }, [selectedCityId]);

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
   * Handle changes in city selection.
   * @param {object} e - Event object.
   */
  const handleCityChange = (e) => {
    const cityId = parseInt(e.target.value, 10);
    setSelectedCityId(cityId);
    localStorage.setItem("selectedCityId", JSON.stringify(cityId)); // Persist city ID in local storage
  };

  /**
   * Define animation variants for the dashboard container.
   */
  const dashboardVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.3,
      },
    },
  };

  /**
   * Define animation variants for each section.
   */
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  /**
   * Define animation variants for the spinner.
   */
  const spinnerVariants = {
    rotate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "linear",
      },
    },
  };

  // Display loading state with a spinning animation and transparent background
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          className="border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full h-16 w-16"
          variants={spinnerVariants}
          animate="rotate"
          role="status"
          aria-label="Loading"
        />
      </div>
    );

  // Display error state
  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-transparent">
        <div
          className="text-center text-red-600 text-xl"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      </div>
    );

  const selectedCity = cities.find((city) => city.id === selectedCityId);
  const data = {
    dailySummaries: [],
    latestWeather: null,
    alerts: [],
    forecast: [],
    ...cityData[selectedCityId],
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"; // Handle missing timestamp
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date(timestamp));
  };

  return (
    <motion.div
      className="p-4 space-y-10 min-h-screen"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }} // Semi-transparent background
      variants={dashboardVariants}
      initial="hidden"
      animate="visible"
    >
      {/* City Selection Dropdown */}
      <motion.div variants={sectionVariants} className="flex justify-center">
        <select
          value={selectedCityId || ""}
          onChange={handleCityChange}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out hover:border-blue-500 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg"
        >
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Weather Data Section */}
      <motion.section variants={sectionVariants}>
        <div
          className="max-w-lg mx-auto rounded-lg shadow-lg p-6 relative"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }} // Semi-transparent background
        >
          {/* Header with City Name and Temperature Toggle */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              {selectedCity?.name || "Selected City"}
            </h2>
            <div className="flex items-center space-x-2">
              <span
                className={`cursor-pointer ${
                  preferences.temp_unit === "Celsius"
                    ? "font-bold"
                    : "opacity-50"
                }`}
                onClick={() => preferences.setTempUnit("Celsius")}
              >
                °C
              </span>
              <span>|</span>
              <span
                className={`cursor-pointer ${
                  preferences.temp_unit === "Fahrenheit"
                    ? "font-bold"
                    : "opacity-50"
                }`}
                onClick={() => preferences.setTempUnit("Fahrenheit")}
              >
                °F
              </span>
            </div>
          </div>

          {/* Weather Details */}
          {data.latestWeather ? (
            <div>
              <div className="flex items-center justify-center my-3">
                <span className="text-7xl font-thin">
                  {convertTemperature(data.latestWeather?.temp).toFixed(0)}°
                </span>
                <span className="ml-4 text-4xl">
                  {data.latestWeather?.main?.toLowerCase() === "clear" && (
                    <img src={clearIcon} alt="clear" className="w-20 h-20" />
                  )}
                  {data.latestWeather?.main?.toLowerCase() === "rain" && (
                    <img src={rainIcon} alt="Rain" className="w-20 h-20" />
                  )}
                  {data.latestWeather?.main?.toLowerCase() === "snow" && (
                    <img src={snowIcon} alt="snow" className="w-20 h-20" />
                  )}
                  {data.latestWeather?.main?.toLowerCase() === "clouds" && (
                    <img src={sunnyIcon} alt="clouds" className="w-20 h-20" />
                  )}
                  {data.latestWeather?.main?.toLowerCase() === "mist" && (
                    <img src={dayMistIcon} alt="mist" className="w-20 h-20" />
                  )}
                  {data.latestWeather?.main?.toLowerCase() === "haze" && (
                    <img src={hazeIcon} alt="haze" className="w-20 h-20" />
                  )}
                  {data.latestWeather?.main?.toLowerCase() === "drizzle" && (
                    <img
                      src={drizzleRainIcon}
                      alt="drizzle"
                      className="w-20 h-20"
                    />
                  )}
                  {data.latestWeather?.main?.toLowerCase() ===
                    "thunderstorm" && (
                    <img
                      src={thunderstormIcon}
                      alt="thunderstorm"
                      className="w-20 h-20"
                    />
                  )}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <p className="text-sm font-medium">
                  {formatDate(data.latestWeather.timestamp)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-200">
              No weather data available.
            </div>
          )}

          {data.latestWeather && (
            <div className="grid grid-cols-2 gap-6 mt-6">
              {/* Feels Like */}
              <div className="flex flex-col items-center space-y-2">
                <p className="text-lg font-semibold">Feels Like</p>
                <div className="flex items-center justify-center space-x-3">
                  <img
                    src={temperatureFeelsLikeIcon}
                    alt="Feels Like"
                    className="w-6 h-6"
                  />
                  <p className="text-lg font-semibold">
                    {convertTemperature(data.latestWeather?.feels_like).toFixed(
                      0
                    )}
                    °
                  </p>
                </div>
              </div>

              {/* Humidity */}
              <div className="flex flex-col items-center space-y-2">
                <p className="text-lg font-semibold">Humidity</p>
                <div className="flex items-center justify-center space-x-3">
                  <img src={humidityIcon} alt="Humidity" className="w-6 h-6" />
                  <p className="text-lg font-semibold">
                    {data.latestWeather?.humidity}%
                  </p>
                </div>
              </div>

              {/* Wind */}
              <div className="flex flex-col items-center space-y-2">
                <p className="text-lg font-semibold">Wind</p>
                <div className="flex items-center justify-center space-x-3">
                  <img src={windIcon} alt="Wind" className="w-6 h-6" />
                  <p className="text-lg font-semibold">
                    {data.latestWeather?.wind_speed} km/h
                  </p>
                </div>
              </div>

              {/* Condition */}
              <div className="flex flex-col items-center space-y-2">
                <p className="text-lg font-semibold">Condition</p>
                <div className="flex items-center justify-center space-x-3">
                  <img
                    src={conditionIcon}
                    alt="Condition"
                    className="w-6 h-6"
                  />
                  <p className="text-lg font-semibold">
                    {data.latestWeather?.main}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sunrise and Sunset */}
          {/* {data.latestWeather && (
            <div className="flex justify-between items-center mt-6 text-sm">
              <div className="flex items-center space-x-1">
                <WiDaySunny size={24} />
                <span>Rise: {data.latestWeather?.sunrise}</span>
              </div>
              <div className="flex items-center space-x-1">
                <WiCloudy size={24} />
                <span>Set: {data.latestWeather?.sunset}</span>
              </div>
            </div>
          )} */}
        </div>
      </motion.section>

      {/* Alerts Section */}
      {/* Conditionally render Alerts if alerts data is available */}
      {Array.isArray(data.alerts) && data.alerts.length > 0 && (
        <motion.section variants={sectionVariants}>
          <Alerts alerts={data.alerts} />
        </motion.section>
      )}

      {/* Historical Trends and Forecast */}
      {/* Adjust the grid based on the availability of HistoricalTrends and Forecast */}
      {(Array.isArray(data.dailySummaries) && data.dailySummaries.length > 0) ||
      (Array.isArray(data.forecast) && data.forecast.length > 0) ? (
        <motion.section
          variants={sectionVariants}
          className={`grid grid-cols-1 lg:grid-cols-${
            Array.isArray(data.dailySummaries) &&
            data.dailySummaries.length > 0 &&
            Array.isArray(data.forecast) &&
            data.forecast.length > 0
              ? "2"
              : "1"
          } gap-6`}
        >
          {/* Historical Trends */}
          {Array.isArray(data.dailySummaries) &&
            data.dailySummaries.length > 0 && (
              <div>
                <HistoricalTrends data={data.dailySummaries} />
              </div>
            )}

          {/* Forecast */}
          {Array.isArray(data.forecast) && data.forecast.length > 0 && (
            <div>
              <Forecast forecast={data.forecast} />
            </div>
          )}
        </motion.section>
      ) : null}

      {/* Daily Summaries Section */}
      <motion.section variants={sectionVariants}>
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Daily Summaries
        </h2>
        {Array.isArray(data.dailySummaries) &&
        data.dailySummaries.length > 0 ? (
          <DailySummaries summaries={data.dailySummaries} />
        ) : (
          <div className="text-center text-gray-600">
            No daily summaries available.
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}

export default Dashboard;
