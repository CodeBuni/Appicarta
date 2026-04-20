import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../ThemeContext";
import { AnimatedLetters, AnimatedWords, RevealText } from "./AnimatedText";
import whiteApp from '../assets/white-app.png';
import darkApp from '../assets/dark-app.png';

// Particle component for background
function Particle({ delay, duration, x, y }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-blue-500/40 dark:bg-red-500/40"
      style={{ left: x, top: y }}
      animate={{
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        y: [0, -100],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

// Floating element with 3D effect
function FloatingElement({ children, delay = 0, x = 0, y = 0 }) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        rotate: [0, 5, 0, -5, 0],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ x, y }}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const containerRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Scroll-based animations
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const textY = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.9]);

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setCurrentTheme(isDark ? 'dark' : 'light');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Mouse move handler for parallax
  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set((e.clientX - centerX) / 50);
      mouseY.set((e.clientY - centerY) / 50);
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      });
    }
  };

  const phoneImage = currentTheme === 'dark' ? darkApp : whiteApp;

  // Generate particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <motion.section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        <div className={`absolute inset-0 ${darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50/80 via-white to-red-50/80"
          }`} />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
            x: useTransform(x, v => v * 30),
            y: useTransform(y, v => v * 30),
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)",
            x: useTransform(x, v => v * -20),
            y: useTransform(y, v => v * -20),
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${darkMode ? '#fff' : '#000'} 1px, transparent 1px),
                             linear-gradient(90deg, ${darkMode ? '#fff' : '#000'} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </motion.div>

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
      </div>

      {/* Floating decorative elements */}
      <FloatingElement delay={0} x="10%" y="20%">
        <motion.div
          className={`absolute w-20 h-20 rounded-2xl ${darkMode ? 'bg-red-500/10' : 'bg-blue-500/10'} backdrop-blur-sm`}
          style={{
            rotateX: useTransform(x, v => v * 20),
            rotateY: useTransform(y, v => v * -20),
          }}
        />
      </FloatingElement>

      <FloatingElement delay={2} x="85%" y="60%">
        <motion.div
          className={`absolute w-16 h-16 rounded-full ${darkMode ? 'bg-blue-500/10' : 'bg-red-500/10'} backdrop-blur-sm`}
          style={{
            rotateX: useTransform(x, v => v * -15),
            rotateY: useTransform(y, v => v * 15),
          }}
        />
      </FloatingElement>

      <FloatingElement delay={1} x="75%" y="15%">
        <motion.div
          className={`absolute w-12 h-12 rounded-lg ${darkMode ? 'bg-purple-500/10' : 'bg-purple-500/10'} backdrop-blur-sm rotate-45`}
          style={{
            rotateX: useTransform(x, v => v * 25),
            rotateY: useTransform(y, v => v * -25),
          }}
        />
      </FloatingElement>

      {/* Main Content */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto"
        style={{ y: textY, opacity, scale }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Left side - Text */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 ${darkMode
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                  }`}
                whileHover={{ scale: 1.05, borderColor: darkMode ? "rgba(239, 68, 68, 0.5)" : "rgba(59, 130, 246, 0.5)" }}
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  ✦
                </motion.span>
                AppiSensor Disponível
              </motion.span>
            </motion.div>

            {/* Main Heading */}
            <div className="mb-6 overflow-hidden">
              <motion.h1
                className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight`}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={`block ${darkMode ? "text-white" : "text-gray-900"}`}>
                  <AnimatedWords text="Bem-vindo à" />
                </span>
              </motion.h1>
            </div>

            <div className="mb-8 overflow-hidden">
              <motion.h1
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-red-500 dark:from-blue-400 dark:via-purple-400 dark:to-red-400"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ backgroundSize: "200% auto" }}
                >
                  Appicarta
                </motion.span>
              </motion.h1>
            </div>

            {/* Description */}
            <motion.p
              className={`text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              Recebe notificações de correio em tempo real, comunica com o teu
              Arco Familiar e mantém tudo organizado de forma simples e segura.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                onClick={() => navigate("/purchase")}
                className={`group relative px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden ${darkMode
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-blue-600 to-blue-700"
                  } text-white shadow-2xl`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-500 to-red-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                  initial={{ x: "-200%" }}
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />

                <span className="relative z-10 flex items-center gap-3">
                  Comprar AppiSensor
                  <motion.svg
                    className="w-5 h-5"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/noticias")}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg border-2 transition-colors ${darkMode
                  ? "border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-400"
                  : "border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                  }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Ver Notícias
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex gap-8 mt-12 justify-center lg:justify-start"
            >
              {[
                { value: "2M+", label: "Downloads" },
                { value: "4.8", label: "App Store" },
                { value: "4.9", label: "Google Play" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="text-center cursor-default"
                >
                  <motion.div
                    className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 1.2 + index * 0.1,
                      duration: 0.5,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right side - Phone Image */}
          <motion.div
            className="relative flex justify-center items-center order-1 lg:order-2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 50 }}
          >
            <motion.div
              className="relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl"
              style={{
                rotateX: useTransform(y, v => v * -15),
                rotateY: useTransform(x, v => v * 15),
                transformPerspective: 1000,
              }}
            >
              {/* Glow layers */}
              <motion.div
                className="absolute -inset-8 rounded-[80px] blur-3xl"
                style={{
                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(239, 68, 68, 0.3))",
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.div
                className="absolute -inset-4 rounded-[60px] blur-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(239, 68, 68, 0.2))",
                }}
                animate={{
                  scale: [1.1, 1, 1.1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />

              {/* Phone image */}
              <motion.img
                key={phoneImage}
                src={phoneImage}
                alt="Appicarta Mobile App"
                className="relative w-full h-auto drop-shadow-2xl"
                style={{
                  filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.3))",
                  transform: "rotate(5deg) scale(1.1)",
                }}
                initial={{ scale: 0.8, rotate: 0, opacity: 0, y: 50 }}
                animate={{
                  scale: 1.1,
                  rotate: 5,
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 1.2,
                  delay: 0.7,
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                whileHover={{
                  scale: 1.15,
                  rotate: 8,
                  transition: { duration: 0.3 },
                }}
              />

              {/* Floating accent elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl opacity-80"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.div
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full opacity-80"
                animate={{
                  y: [0, 10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>


    </motion.section >
  );
}
