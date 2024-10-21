import React from "react";
import PropTypes from "prop-types"; // Import PropTypes for prop validation
import { FaExclamationTriangle } from "react-icons/fa"; // Import React Icon
import { motion } from "framer-motion"; // Import Framer Motion
import { Link } from "react-router-dom"; // Import Link for navigation

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Updates the state when an error is thrown.
   * @param {Error} error - The error that was thrown.
   * @returns {object} - New state with hasError set to true.
   */
  static getDerivedStateFromError(error) {
    console.log(error);

    // Update state to display fallback UI
    return { hasError: true };
  }

  /**
   * Logs the error details.
   * @param {Error} error - The error that was thrown.
   * @param {object} errorInfo - Additional information about the error.
   */
  componentDidCatch(error, errorInfo) {
    // Removed console.error to eliminate unwanted logs
    // You can integrate an error reporting service here if needed
    // Example: logErrorToService(error, errorInfo);
  }

  /**
   * Define animation variants for the fallback UI.
   */
  fallbackVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  /**
   * Define animation variants for the icon.
   */
  iconVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1 },
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI with enhanced design and animations
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 p-4">
          <motion.div
            className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-10 rounded-lg shadow-2xl max-w-md w-full text-center"
            variants={this.fallbackVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Error Icon */}
            <motion.div
              className="mx-auto mb-6"
              variants={this.iconVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FaExclamationTriangle className="text-red-500 text-6xl" />
            </motion.div>

            {/* Error Message */}
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              Oops! Something went wrong.
            </h1>
            <p className="text-gray-600 mb-6">
              We&apos;re sorry for the inconvenience. Please try refreshing the
              page or contact support if the problem persists.
            </p>

            {/* Action Button */}
            <Link to="/" className="inline-block">
              <motion.button
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Go to Home
              </motion.button>
            </Link>
          </motion.div>
        </div>
      );
    }

    // Render children if no error
    return this.props.children;
  }
}

// Define propTypes for ErrorBoundary
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired, // children must be a React node and is required
};

export default ErrorBoundary;
