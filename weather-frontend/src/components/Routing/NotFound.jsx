import { FaExclamationTriangle, FaHome } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * NotFound Component
 * Displays a custom 404 error page when users navigate to undefined routes.
 */
function NotFound() {
  /**
   * Define animation variants for the container and elements.
   */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1, transition: { duration: 0.5, delay: 0.3 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, backgroundColor: "#2563EB" }, // Tailwind's blue-600
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-red-100 to-red-200 p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Error Icon */}
      <motion.div
        className="text-red-500 mb-6"
        variants={iconVariants}
        initial="hidden"
        animate="visible"
      >
        <FaExclamationTriangle className="text-6xl" />
      </motion.div>

      {/* Error Message */}
      <motion.h1
        className="text-4xl font-bold text-gray-800 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        404 - Page Not Found
      </motion.h1>
      <motion.p
        className="text-gray-600 text-center mb-6 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        Oops! The page you&apos;re looking for doesn&apos;t exist. It might have
        been moved or deleted.
      </motion.p>

      {/* Home Button */}
      <Link to="/">
        <motion.button
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FaHome className="mr-2" />
          Go to Home
        </motion.button>
      </Link>
    </motion.div>
  );
}

export default NotFound;
