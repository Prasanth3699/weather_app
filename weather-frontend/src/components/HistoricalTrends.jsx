import PropTypes from "prop-types";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { UserPreferencesContext } from "../contexts/UserPreferencesContext";
import "chartjs-adapter-date-fns";
import { motion } from "framer-motion"; // Import Framer Motion
import { useContext } from "react";

// Register necessary components
ChartJS.register(
  TimeScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

/**
 * Component to display historical temperature and humidity trends using Chart.js.
 * @param {Array} data - Array of historical data objects.
 */
function HistoricalTrends({ data = [] }) {
  const preferences = useContext(UserPreferencesContext);

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
   * Parse date string to ISO format (YYYY-MM-DD).
   * @param {string} dateString - Date string to parse.
   * @returns {string} Parsed date string.
   */
  const parseDate = (dateString) =>
    new Date(dateString).toISOString().split("T")[0]; // Ensure correct date parsing

  // Prepare chart labels and datasets
  const labels = data.map((summary) => parseDate(summary.date));
  const avgTemps = data.map((summary) => convertTemperature(summary.avg_temp));
  const maxTemps = data.map((summary) => convertTemperature(summary.max_temp));
  const minTemps = data.map((summary) => convertTemperature(summary.min_temp));
  const humidity = data.map((summary) => summary.avg_humidity || 0); // Default to 0 if undefined

  const chartData = {
    labels,
    datasets: [
      {
        type: "bar",
        label: "Max Temperature",
        data: maxTemps,
        backgroundColor: "rgba(255, 99, 132, 0.6)", // Semi-transparent red
        borderColor: "rgba(255, 99, 132, 1)", // Solid red border
        borderWidth: 1,
        yAxisID: "y",
      },
      {
        type: "bar",
        label: "Min Temperature",
        data: minTemps,
        backgroundColor: "rgba(54, 162, 235, 0.6)", // Semi-transparent blue
        borderColor: "rgba(54, 162, 235, 1)", // Solid blue border
        borderWidth: 1,
        yAxisID: "y",
      },
      {
        type: "bar",
        label: "Average Temperature",
        data: avgTemps,
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Semi-transparent teal
        borderColor: "rgba(75, 192, 192, 1)", // Solid teal border
        borderWidth: 1,
        yAxisID: "y",
      },
      {
        type: "line",
        label: "Humidity",
        data: humidity,
        borderColor: "rgba(255, 159, 64, 1)", // Solid orange
        backgroundColor: "rgba(255, 159, 64, 0.4)", // Semi-transparent orange
        tension: 0.4,
        fill: true,
        yAxisID: "y1",
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows the chart to adjust its height
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: "Historical Temperature and Humidity Trends",
        font: { size: 18, weight: "bold" },
        color: "#333", // Darker title color
      },
      legend: {
        position: "top",
        labels: {
          font: { size: 14 },
          color: "#333", // Darker legend text
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.raw || 0;
            const unit =
              context.dataset.label === "Humidity"
                ? "%"
                : `°${preferences.temp_unit === "Fahrenheit" ? "F" : "C"}`;
            return `${label}: ${value.toFixed(2)}${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          displayFormats: { day: "MMM dd" },
        },
        title: {
          display: true,
          text: "Date",
          font: { size: 14 },
          color: "#333",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          color: "#555", // Darker tick color
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: `Temperature (${
            preferences.temp_unit === "Fahrenheit" ? "°F" : "°C"
          })`,
          font: { size: 14 },
          color: "#ff6384", // Color matching the Max Temp dataset
        },
        ticks: {
          callback: (value) => `${value}°`,
          color: "#ff6384", // Matching tick color
        },
        grid: {
          color: "#e0e0e0", // Light gray grid lines
        },
        min: 0,
        suggestedMax: Math.max(...maxTemps) + 5,
        position: "left",
      },
      y1: {
        title: {
          display: true,
          text: "Humidity (%)",
          font: { size: 14 },
          color: "#ff9f40", // Color matching the Humidity dataset
        },
        ticks: {
          callback: (value) => `${value}%`,
          color: "#ff9f40", // Matching tick color
        },
        grid: {
          drawOnChartArea: false, // Prevents grid lines from overlapping
        },
        min: 0,
        max: 100,
        position: "right",
      },
    },
  };

  return (
    <motion.div
      className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-lg shadow-lg w-full h-96 md:h-[500px]"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Chart type="bar" data={chartData} options={options} />
    </motion.div>
  );
}

HistoricalTrends.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      avg_temp: PropTypes.number.isRequired,
      max_temp: PropTypes.number.isRequired,
      min_temp: PropTypes.number.isRequired,
      avg_humidity: PropTypes.number,
    })
  ),
};

export default HistoricalTrends;
