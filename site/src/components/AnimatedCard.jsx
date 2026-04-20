import { motion } from "framer-motion";
import { useState } from "react";

export default function AnimatedCard({
  children,
  className = "",
  delay = 0,
  hoverScale = 1.02,
  hoverY = -10,
  glowOnHover = true,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: hoverY,
        scale: hoverScale,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      {glowOnHover && (
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0"
          animate={{
            opacity: isHovered ? 0.5 : 0,
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
          style={{
            background: "radial-gradient(circle at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
            filter: "blur(20px)",
            zIndex: -1,
          }}
        />
      )}

      {/* Border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(239, 68, 68, 0.5))",
          padding: "2px",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {children}
    </motion.div>
  );
}

export function AnimatedButton({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = "relative overflow-hidden font-semibold rounded-xl transition-all duration-300";

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-red-500 text-white shadow-lg shadow-blue-500/25",
    secondary: "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700",
    ghost: "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      {...props}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
        initial={{ x: "-200%" }}
        animate={{ x: isHovered ? "200%" : "-200%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

export function MagneticButton({ children, className = "", ...props }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
