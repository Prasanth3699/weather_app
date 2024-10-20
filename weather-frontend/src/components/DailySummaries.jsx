import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { WiThermometer, WiWindy, WiHumidity } from "react-icons/wi";

function DailySummaries({ summaries }) {
  if (!Array.isArray(summaries) || summaries.length === 0) {
    return (
      <div className="text-center text-gray-600 py-10">
        No summaries available.
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05 },
    }),
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
      {summaries.map((summary, index) => (
        <motion.div
          key={summary.id}
          className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg p-4"
          custom={index}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-800">
              {summary.city.name}
            </h3>
            <p className="text-sm text-gray-500">{formatDate(summary.date)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <WiThermometer className="text-red-500 w-6 h-6" />
              <p className="text-sm text-gray-800">
                Max: {summary.max_temp.toFixed(2)}°
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <WiThermometer className="text-blue-500 w-6 h-6" />
              <p className="text-sm text-gray-800">
                Min: {summary.min_temp.toFixed(2)}°
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <WiThermometer className="text-orange-500 w-6 h-6" />
              <p className="text-sm text-gray-800">
                Avg: {summary.avg_temp.toFixed(2)}°
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <WiHumidity className="text-blue-500 w-6 h-6" />
              <p className="text-sm text-gray-800">
                Humidity: {summary.avg_humidity.toFixed(2)}%
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <WiWindy className="text-gray-500 w-6 h-6" />
              <p className="text-sm text-gray-800">
                Wind: {summary.avg_wind_speed.toFixed(2)} km/h
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-semibold">Condition:</span>
            <span className="text-gray-800 ml-1">
              {summary.dominant_condition}
            </span>
            <p>
              <small className="text-xs text-gray-500">
                {summary.dominant_reasoning}
              </small>
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

DailySummaries.propTypes = {
  summaries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      city: PropTypes.shape({
        name: PropTypes.string.isRequired,
      }).isRequired,
      date: PropTypes.string.isRequired,
      avg_temp: PropTypes.number.isRequired,
      max_temp: PropTypes.number.isRequired,
      min_temp: PropTypes.number.isRequired,
      avg_humidity: PropTypes.number.isRequired,
      avg_wind_speed: PropTypes.number.isRequired,
      dominant_condition: PropTypes.string.isRequired,
      dominant_reasoning: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default DailySummaries;
