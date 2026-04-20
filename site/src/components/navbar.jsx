import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useTheme } from "../ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import { Link as ScrollLink } from "react-scroll";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logo from "../assets/logo.png";

const navLinks = [
  { name: "Início", to: "hero", type: "scroll" },
  { name: "Funcionalidades", to: "features", type: "scroll" },
  { name: "Sobre", to: "about", type: "scroll" },
  { name: "Opiniões", to: "testimonials", type: "scroll" },
  { name: "Notícias", to: "/noticias", type: "route" },
];

export default function Navbar() {
  const { darkMode, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("hero");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();

  const isHomePage = location.pathname === "/";

  // Handle scroll for navbar visibility and background
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);

    // Hide/show on scroll direction
    if (latest > lastScrollY && latest > 100) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(latest);
  });

  // Track active section on scroll
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const sections = ["hero", "features", "about", "testimonials"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveLink(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const handleNavClick = (link) => {
    if (link.type === "route") {
      navigate(link.to);
    } else if (!isHomePage && link.type === "scroll") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(link.to);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    setMenuOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ y: -100 }}
        animate={{
          y: isVisible ? 0 : -100,
          backgroundColor: scrolled
            ? darkMode
              ? "rgba(17, 24, 39, 0.95)"
              : "rgba(255, 255, 255, 0.95)"
            : darkMode
              ? "rgba(31, 41, 55, 0.7)"
              : "rgba(255, 255, 255, 0.7)",
        }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`fixed top-0 w-full z-50 backdrop-blur-xl border-b ${
          scrolled
            ? darkMode
              ? "border-gray-800 shadow-lg shadow-black/10"
              : "border-gray-200 shadow-lg shadow-black/5"
            : "border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              onClick={() => navigate("/")}
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={logo}
                  alt="Appicarta Logo"
                  className="w-10 h-10 object-contain"
                />
              </motion.div>
              <motion.span
                className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
                  darkMode
                    ? "from-red-400 to-red-600"
                    : "from-blue-600 to-blue-800"
                }`}
                whileHover={{
                  backgroundPosition: ["0% 50%", "100% 50%"],
                }}
                transition={{ duration: 0.5 }}
              >
                appicarta
              </motion.span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link, index) => {
                const isActive = isHomePage
                  ? link.type === "scroll" && activeLink === link.to
                  : link.type === "route" && location.pathname === link.to;

                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="relative"
                  >
                    {link.type === "scroll" ? (
                      <>
                        {isHomePage ? (
                          <ScrollLink
                            to={link.to}
                            smooth={true}
                            duration={800}
                            offset={-80}
                            className={`relative px-4 py-2 text-sm font-medium transition-colors cursor-pointer block ${
                              darkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
                            }`}
                          >
                            <span className={isActive ? (darkMode ? "text-red-400" : "text-blue-600") : ""}>
                              {link.name}
                            </span>
                            {isActive && (
                              <motion.div
                                layoutId="activeNav"
                                className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${
                                  darkMode ? "bg-red-500" : "bg-blue-600"
                                }`}
                                initial={false}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                }}
                              />
                            )}
                          </ScrollLink>
                        ) : (
                          <motion.button
                            onClick={() => handleNavClick(link)}
                            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                              darkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
                            }`}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span>{link.name}</span>
                          </motion.button>
                        )}
                      </>
                    ) : (
                      <motion.button
                        onClick={() => handleNavClick(link)}
                        className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                          darkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className={isActive ? (darkMode ? "text-red-400" : "text-blue-600") : ""}>
                          {link.name}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="activeNav"
                            className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${
                              darkMode ? "bg-red-500" : "bg-blue-600"
                            }`}
                            initial={false}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          />
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className={`relative p-2 rounded-xl transition-colors ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.div
                      key="sun"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaSun className="text-yellow-400 text-xl" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaMoon className="text-gray-700 text-xl" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden p-2 rounded-xl"
                onClick={() => setMenuOpen(!menuOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <motion.span
                    className={`w-full h-0.5 rounded-full origin-left ${
                      darkMode ? "bg-white" : "bg-gray-900"
                    }`}
                    animate={{
                      rotate: menuOpen ? 45 : 0,
                      y: menuOpen ? 0 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.span
                    className={`w-full h-0.5 rounded-full ${
                      darkMode ? "bg-white" : "bg-gray-900"
                    }`}
                    animate={{
                      opacity: menuOpen ? 0 : 1,
                      x: menuOpen ? 20 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.span
                    className={`w-full h-0.5 rounded-full origin-left ${
                      darkMode ? "bg-white" : "bg-gray-900"
                    }`}
                    animate={{
                      rotate: menuOpen ? -45 : 0,
                      y: menuOpen ? 0 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`md:hidden overflow-hidden ${
                darkMode ? "bg-gray-900/95" : "bg-white/95"
              } backdrop-blur-xl border-t ${
                darkMode ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <nav className="px-4 py-6 space-y-2">
                {navLinks.map((link, index) => {
                  const isActive = isHomePage
                    ? link.type === "scroll" && activeLink === link.to
                    : link.type === "route" && location.pathname === link.to;

                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {link.type === "scroll" ? (
                        <>
                          {isHomePage ? (
                            <ScrollLink
                              to={link.to}
                              smooth={true}
                              duration={800}
                              offset={-80}
                              className={`block py-3 text-lg font-medium transition-colors ${
                                isActive
                                  ? darkMode
                                    ? "text-red-400"
                                    : "text-blue-600"
                                  : darkMode
                                    ? "text-gray-300"
                                    : "text-gray-700"
                              }`}
                              onClick={() => setMenuOpen(false)}
                            >
                              <motion.span
                                className="flex items-center gap-3"
                                whileHover={{ x: 10 }}
                              >
                                <span
                                  className={`h-0.5 rounded-full transition-all ${
                                    isActive
                                      ? darkMode
                                        ? "bg-red-500 w-8"
                                        : "bg-blue-600 w-8"
                                      : darkMode
                                        ? "bg-gray-700 w-4"
                                        : "bg-gray-300 w-4"
                                  }`}
                                />
                                {link.name}
                              </motion.span>
                            </ScrollLink>
                          ) : (
                            <motion.button
                              onClick={() => handleNavClick(link)}
                              className={`block w-full text-left py-3 text-lg font-medium transition-colors ${
                                darkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              <motion.span
                                className="flex items-center gap-3"
                                whileHover={{ x: 10 }}
                              >
                                <span className={`h-0.5 rounded-full transition-all ${darkMode ? "bg-gray-700 w-4" : "bg-gray-300 w-4"}`} />
                                {link.name}
                              </motion.span>
                            </motion.button>
                          )}
                        </>
                      ) : (
                        <motion.button
                          onClick={() => handleNavClick(link)}
                          className={`block w-full text-left py-3 text-lg font-medium transition-colors ${
                            isActive
                              ? darkMode
                                ? "text-red-400"
                                : "text-blue-600"
                              : darkMode
                                ? "text-gray-300"
                                : "text-gray-700"
                          }`}
                        >
                          <motion.span
                            className="flex items-center gap-3"
                            whileHover={{ x: 10 }}
                          >
                            <span
                              className={`h-0.5 rounded-full transition-all ${
                                isActive
                                  ? darkMode
                                    ? "bg-red-500 w-8"
                                    : "bg-blue-600 w-8"
                                  : darkMode
                                    ? "bg-gray-700 w-4"
                                    : "bg-gray-300 w-4"
                              }`}
                            />
                            {link.name}
                          </motion.span>
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
