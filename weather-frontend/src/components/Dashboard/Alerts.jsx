import PropTypes from "prop-types";
import { motion } from "framer-motion"; // Import Framer Motion
import { FaExclamationTriangle } from "react-icons/fa"; // Import an alert icon from React Icons

/**
 * Component to display a list of alerts in a modern and responsive UI with animations.
 * @param {Array} alerts - Array of alert objects to display.
 */
function Alerts({ alerts }) {
  // Ensure alerts is always an array
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  /**
   * Define animation variants for the alert items.
   */
  const alertVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Alerts
      </h2>
      {safeAlerts.length === 0 ? (
        <p className="text-center text-gray-600">No alerts found.</p>
      ) : (
        <ul className="space-y-4">
          {safeAlerts.map((alert) => (
            <motion.li
              key={alert.id}
              className="flex items-center p-4 bg-red-100 rounded shadow"
              variants={alertVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Alert Icon */}
              <FaExclamationTriangle className="text-red-500 text-3xl mr-4 flex-shrink-0" />

              {/* Alert Details */}
              <div>
                <p className="font-bold text-gray-800">{alert.message}</p>
                <p className="text-sm text-gray-600">
                  {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

Alerts.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      message: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Alerts;
