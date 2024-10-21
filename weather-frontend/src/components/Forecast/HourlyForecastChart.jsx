import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion"; // Import Framer Motion

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

/**
 * Component to display hourly forecast data using Chart.js with animations.
 * @param {Array} hourlyData - Array of hourly forecast data objects.
 */
function HourlyForecastChart({ hourlyData }) {
  // Sort data by timestamp to ensure chronological order
  const sortedData = [...hourlyData].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Prepare labels and datasets for the chart
  const labels = sortedData.map((entry) =>
    new Date(entry.timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  );

  const temperatureData = sortedData.map((entry) => entry.temp);
  const feelsLikeData = sortedData.map((entry) => entry.feels_like);
  const humidityData = sortedData.map((entry) => entry.humidity);
  const windSpeedData = sortedData.map((entry) => entry.wind_speed);

  const data = {
    labels,
    datasets: [
      {
        type: "line",
        label: "Temperature (°C)",
        data: temperatureData,
        borderColor: "#FF6347", // Coral for temperature
        backgroundColor: "transparent",
        pointBackgroundColor: "#FF6347",
        pointBorderColor: "#fff",
        tension: 0.4,
        yAxisID: "y",
      },
      {
        type: "line",
        label: "Feels Like (°C)",
        data: feelsLikeData,
        borderColor: "#FFA07A", // Light Salmon for feels like
        backgroundColor: "transparent",
        pointBackgroundColor: "#FFA07A",
        pointBorderColor: "#fff",
        tension: 0.4,
        yAxisID: "y",
      },
      {
        type: "bar",
        label: "Humidity (%)",
        data: humidityData,
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Aqua for humidity
        borderRadius: 5,
        barPercentage: 0.4,
        categoryPercentage: 0.6,
        yAxisID: "y1",
      },
      {
        type: "bar",
        label: "Wind Speed (m/s)",
        data: windSpeedData,
        backgroundColor: "rgba(70, 130, 180, 0.7)", // Steel Blue for wind speed
        borderRadius: 5,
        barPercentage: 0.4,
        categoryPercentage: 0.6,
        yAxisID: "y2",
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
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 15,
          padding: 10,
          font: {
            size: 14,
          },
          color: "#333", // Darker legend text
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset, index) => ({
              text: dataset.label,
              fillStyle: dataset.borderColor || dataset.backgroundColor,
              strokeStyle: dataset.borderColor || dataset.backgroundColor,
              lineWidth: 2,
              hidden: !chart.isDatasetVisible(index),
              index,
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const label = tooltipItem.dataset.label;
            const value = tooltipItem.raw;

            if (label.includes("Temperature") || label.includes("Feels Like")) {
              return `${label}: ${value.toFixed(1)}°C`;
            } else if (label === "Wind Speed (m/s)") {
              return `${label}: ${value.toFixed(1)} m/s`;
            } else {
              return `${label}: ${value}%`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "Time",
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
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "Temperature (°C)",
          font: { size: 14 },
          color: "#FF6347", // Match Temperature line color
        },
        ticks: {
          callback: (value) => `${value}°`,
          color: "#FF6347",
        },
        grid: {
          color: "#e0e0e0",
        },
      },
      y1: {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "Humidity (%)",
          font: { size: 14 },
          color: "rgba(75, 192, 192, 1)", // Match Humidity bar color
        },
        ticks: {
          callback: (value) => `${value}%`,
          color: "rgba(75, 192, 192, 1)",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "Wind Speed (m/s)",
          font: { size: 14 },
          color: "rgba(70, 130, 180, 1)", // Match Wind Speed bar color
        },
        ticks: {
          callback: (value) => `${value} m/s`,
          color: "rgba(70, 130, 180, 1)",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <motion.div
      className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-lg shadow-lg w-full h-80 md:h-96"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Line data={data} options={options} />
    </motion.div>
  );
}

HourlyForecastChart.propTypes = {
  hourlyData: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.string.isRequired,
      temp: PropTypes.number.isRequired,
      feels_like: PropTypes.number.isRequired,
      humidity: PropTypes.number.isRequired,
      wind_speed: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default HourlyForecastChart;
