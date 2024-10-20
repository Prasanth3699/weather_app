import { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { FaUserPlus, FaEnvelope, FaLock } from "react-icons/fa"; // Import React Icons
import { motion } from "framer-motion"; // Import Framer Motion
import { Link } from "react-router-dom"; // Import Link for navigation

/**
 * Register Component
 * Handles user registration by collecting username, email, and password.
 * Utilizes AuthContext for managing authentication state.
 */
function Register() {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "", // Ensure this field is included
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * Handle input field changes.
   * @param {object} e - Event object.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error and success messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  /**
   * Handle form submission for registration.
   * @param {object} e - Event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password confirmation
    if (form.password !== form.password2) {
      setError("Passwords don't match.");
      return;
    }

    try {
      // Call the register function from AuthContext
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setSuccess("Registration successful. Redirecting to dashboard...");
      // Optionally, implement redirection or auto-login here
    } catch (err) {
      if (err.response && err.response.data) {
        // Combine all error messages into a single string
        const errorMessages = Object.values(err.response.data).flat().join(" ");
        setError(errorMessages);
      } else {
        setError("Registration failed. Please try again.");
      }
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-100 to-green-300 p-4">
      <motion.div
        className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <FaUserPlus className="text-3xl text-green-500 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-800">Register</h2>
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

        {/* Success Message */}
        {success && (
          <motion.div
            className="mb-4 text-green-600 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {success}
          </motion.div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <motion.div
            className="relative"
            whileFocus="focus"
            variants={inputVariants}
          >
            <FaUserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              placeholder="Choose a username"
            />
          </motion.div>

          {/* Email Field */}
          <motion.div
            className="relative"
            whileFocus="focus"
            variants={inputVariants}
          >
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              placeholder="Enter your email"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              placeholder="Create a password"
            />
          </motion.div>

          {/* Confirm Password Field */}
          <motion.div
            className="relative"
            whileFocus="focus"
            variants={inputVariants}
          >
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password2"
              value={form.password2}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              placeholder="Confirm your password"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full flex items-center justify-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Register
          </motion.button>
        </form>

        {/* Login Link */}
        <div className="mt-4 text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-green-600 hover:underline">
            Login here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
