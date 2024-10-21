import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { FiMenu, FiX, FiUser, FiChevronDown } from "react-icons/fi"; // React Icons
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const toggleProfileMenu = () => setProfileMenuOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const capitalizeUsername = (username) =>
    username.charAt(0).toUpperCase() + username.slice(1);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        event.target.id !== "mobile-menu-button"
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Animation variants for dropdown menus
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <header className="bg-white bg-opacity-60 backdrop-blur-md fixed top-0 w-full z-50 shadow-md">
      <div className="container mx-auto px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-gray-800 hover:text-blue-500 transition-colors"
        >
          WeatherMonitor
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6 items-center">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-gray-800 hover:text-blue-500 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/thresholds"
                className="text-gray-800 hover:text-blue-500 transition-colors"
              >
                Thresholds
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-1 text-gray-800 hover:text-blue-500 transition-colors focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded={isProfileMenuOpen}
                >
                  <FiUser className="w-5 h-5" />
                  <span className="hidden sm:block">
                    {capitalizeUsername(user.username)}
                  </span>
                  <FiChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2"
                      role="menu"
                      aria-label="Profile Menu"
                    >
                      <div className="px-4 py-2 text-sm text-gray-700">
                        {capitalizeUsername(user.username)}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-800 hover:text-blue-500 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-800 hover:text-blue-500 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            id="mobile-menu-button"
            aria-label="Toggle Menu"
            aria-expanded={isMobileMenuOpen}
            className="text-gray-800 hover:text-blue-500 transition-colors focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            ref={mobileMenuRef}
            className="md:hidden bg-white bg-opacity-90 backdrop-blur-md shadow-md"
          >
            <div className="px-6 py-4 space-y-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-800 text-lg hover:text-blue-500 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/thresholds"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-800 text-lg hover:text-blue-500 transition-colors"
                  >
                    Thresholds
                  </Link>

                  {/* Profile Dropdown in Mobile */}
                  <div className="relative">
                    <button
                      onClick={toggleProfileMenu}
                      className="flex items-center w-full text-gray-800 text-lg hover:text-blue-500 transition-colors focus:outline-none"
                      aria-haspopup="true"
                      aria-expanded={isProfileMenuOpen}
                    >
                      <FiUser className="w-5 h-5 mr-2" />
                      {capitalizeUsername(user.username)}
                      <FiChevronDown className="w-4 h-4 ml-auto" />
                    </button>

                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={dropdownVariants}
                          transition={{ duration: 0.2 }}
                          className="mt-2 ml-7 w-40 bg-white rounded-md shadow-lg py-2"
                          role="menu"
                          aria-label="Profile Menu"
                        >
                          <button
                            onClick={() => {
                              handleLogout();
                              setMobileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                            role="menuitem"
                          >
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-800 text-lg hover:text-blue-500 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-800 text-lg hover:text-blue-500 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
