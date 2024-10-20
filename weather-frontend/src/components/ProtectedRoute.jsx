/* eslint-disable react/prop-types */
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { FaSpinner } from "react-icons/fa"; // Import a spinner icon from React Icons
import { motion } from "framer-motion"; // Import Framer Motion

/**
 * Component to protect routes by checking user authentication.
 * If the user is authenticated, render the child components.
 * If not, redirect to the login page.
 * While authentication status is loading, display a loading spinner.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to render if authenticated.
 * @returns {React.ReactNode} - Rendered component based on authentication status.
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  /**
   * Define animation variants for the loading spinner.
   */
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "linear",
      },
    },
  };

  if (loading) {
    // Render a modern, animated loading spinner
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-gray-100 to-gray-200">
        <motion.div
          variants={spinnerVariants}
          animate="animate"
          className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg rounded-full shadow-lg"
        >
          <FaSpinner className="text-blue-500 text-4xl" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/login" replace />;
  }

  // Render child components for authenticated users
  return children;
}

export default ProtectedRoute;
