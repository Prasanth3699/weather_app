import PropTypes from "prop-types";
import { useContext } from "react";
import { UserPreferencesContext } from "../contexts/UserPreferencesContext";
import {
  WiDaySunny,
  WiRain,
  WiSnow,
  WiCloudy,
  WiThunderstorm,
  WiFog,
} from "react-icons/wi";

function ForecastList({ forecast }) {
  const preferences = useContext(UserPreferencesContext);

  const convertTemperature = (tempCelsius) =>
    preferences.temp_unit === "Fahrenheit"
      ? (tempCelsius * 9) / 5 + 32
      : tempCelsius;

  const getWeatherIcon = (main) => {
    switch (main.toLowerCase()) {
      case "clear":
        return <WiDaySunny size={32} color="#f7d358" />;
      case "rain":
        return <WiRain size={32} color="#00aaff" />;
      case "snow":
        return <WiSnow size={32} color="#00aaff" />;
      case "clouds":
        return <WiCloudy size={32} color="#888" />;
      case "thunderstorm":
        return <WiThunderstorm size={32} color="#f0e68c" />;
      case "fog":
      case "mist":
        return <WiFog size={32} color="#aaa" />;
      default:
        return <WiDaySunny size={32} color="#f7d358" />;
    }
  };

  return (
    <div className="forecast-container">
      {forecast.map((entry) => (
        <div key={entry.id} className="forecast-card">
          <p className="text-sm font-medium">
            {new Date(entry.timestamp).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(entry.timestamp).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="my-2">{getWeatherIcon(entry.main)}</div>
          <p className="text-lg font-semibold">
            {convertTemperature(entry.temp).toFixed(1)}°
            {preferences.temp_unit === "Fahrenheit" ? "F" : "C"}
          </p>
          <p className="text-xs text-gray-600">
            Feels Like: {convertTemperature(entry.feels_like).toFixed(1)}°
          </p>
          <p className="text-xs text-gray-600">Humidity: {entry.humidity}%</p>
          <p className="text-xs text-gray-600">Wind: {entry.wind_speed} km/h</p>
        </div>
      ))}
    </div>
  );
}

ForecastList.propTypes = {
  forecast: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      main: PropTypes.string.isRequired,
      temp: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
      feels_like: PropTypes.number.isRequired,
      humidity: PropTypes.number.isRequired,
      wind_speed: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ForecastList;
