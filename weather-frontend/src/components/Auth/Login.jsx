import { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { FaUser, FaLock } from "react-icons/fa"; // Import React Icons
import { motion } from "framer-motion"; // Import Framer Motion
import { Link } from "react-router-dom"; // Import Link for navigation

/**
 * Login Component
 * Handles user authentication by collecting username and password.
 * Utilizes AuthContext for managing authentication state.
 */
function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  /**
   * Handle input field changes.
   * @param {object} e - Event object.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  /**
   * Handle form submission for login.
   * @param {object} e - Event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.username, form.password);
    } catch (err) {
      console.log(err);

      setError("Invalid credentials. Please try again.");
    }
  };

  /**
   * Define animation variants for the container and form elements.
   */
  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
      },
    },
  };

  const inputVariants = {
    focus: {
      scale: 1.02,
      boxShadow: "0px 0px 8px rgba(59, 130, 246, 0.5)",
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-300 p-4">
      <motion.div
        className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <FaUser className="text-3xl text-blue-500 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-800">Login</h2>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-4 text-red-600 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <motion.div
            className="relative"
            whileFocus="focus"
            variants={inputVariants}
          >
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter your username"
            />
          </motion.div>

          {/* Password Field */}
          <motion.div
            className="relative"
            whileFocus="focus"
            variants={inputVariants}
          >
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter your password"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Login
          </motion.button>
        </form>

        {/* Forgot Password Link */}
        <div className="mt-4 text-center">
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
