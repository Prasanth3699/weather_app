import { motion } from "framer-motion"; // Import Framer Motion

/**
 * Footer Component
 * Displays the application's footer with modern styling and animations.
 */
function Footer() {
  /**
   * Define animation variants for the footer.
   */
  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20,
      },
    },
  };

  return (
    <motion.footer
      className="w-full h-24 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg shadow-inner flex items-center justify-center"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center space-x-4 text-center">
        {/* Footer Text */}
        <span className="text-gray-700 text-lg">
          © {new Date().getFullYear()} Weather Monitoring App
        </span>
      </div>
    </motion.footer>
  );
}

export default Footer;
