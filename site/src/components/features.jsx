import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Sparkles, Mail, Users, Bell, Zap, Shield, Clock } from "lucide-react";
import { useTheme } from "../ThemeContext";

const featuresList = [
  {
    icon: Bell,
    title: "Notificações Instantâneas",
    text: "Recebe alertas automáticos assim que chega correio, sem precisares de verificar a caixa.",
    color: "from-blue-400 to-indigo-600",
    bgGlow: "bg-blue-500/20",
    delay: 0,
  },
  {
    icon: Users,
    title: "Arco Familiar",
    text: "Partilha o acesso ao correio com familiares para uma gestão mais simples e colaborativa.",
    color: "from-purple-400 to-pink-600",
    bgGlow: "bg-purple-500/20",
    delay: 0.1,
  },
  {
    icon: Mail,
    title: "Comunicação Segura",
    text: "Envia e recebe mensagens privadas com os membros do teu Arco Familiar.",
    color: "from-emerald-400 to-teal-600",
    bgGlow: "bg-emerald-500/20",
    delay: 0.2,
  },
  {
    icon: Sparkles,
    title: "Design Moderno",
    text: "Uma interface intuitiva e visualmente apelativa para o dia a dia.",
    color: "from-orange-400 to-red-600",
    bgGlow: "bg-orange-500/20",
    delay: 0.3,
  },
];

// 3D Card component with mouse tracking
function FeatureCard({ feature, index, darkMode }) {
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const Icon = feature.icon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay: feature.delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className="group relative h-full"
    >
      {/* Glow effect behind card */}
      <motion.div
        className={`absolute -inset-4 rounded-3xl ${feature.bgGlow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        style={{ transform: "translateZ(-50px)" }}
      />

      {/* Card content */}
      <div
        className={`relative h-full p-8 rounded-3xl border backdrop-blur-sm overflow-hidden transition-all duration-500 ${
          darkMode
            ? "bg-gray-800/60 border-gray-700/50 group-hover:bg-gray-800/80 group-hover:border-gray-600"
            : "bg-white/70 border-gray-200/50 group-hover:bg-white/90 group-hover:border-gray-300"
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Animated gradient background on hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />

        {/* Floating particles inside card */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${feature.color}`}
              initial={{
                x: Math.random() * 100 + "%",
                y: "100%",
                opacity: 0,
              }}
              animate={{
                y: "-100%",
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Icon container with 3D effect */}
        <motion.div
          className={`relative w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}
          style={{ transform: "translateZ(30px)" }}
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/30 to-white/0"
            initial={{ x: "-100%", y: "-100%" }}
            whileHover={{ x: "100%", y: "100%" }}
            transition={{ duration: 0.6 }}
          />
        </motion.div>

        {/* Text content */}
        <div style={{ transform: "translateZ(20px)" }}>
          <motion.h3
            className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: feature.delay + 0.2 }}
          >
            {feature.title}
          </motion.h3>

          <motion.p
            className={`leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: feature.delay + 0.3 }}
          >
            {feature.text}
          </motion.p>
        </div>

        {/* Bottom gradient line */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transform origin-left`}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ delay: feature.delay + 0.4, duration: 0.6 }}
        />

        {/* Corner decoration */}
        <motion.div
          className={`absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            darkMode ? "border-gray-600" : "border-gray-300"
          }`}
        />
      </div>
    </motion.div>
  );
}

export default function Features() {
  const { darkMode } = useTheme();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  return (
    <section
      ref={containerRef}
      id="features"
      className={`relative min-h-screen py-32 overflow-hidden ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Dynamic Background */}
      <motion.div
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        {/* Animated gradient orbs */}
        <motion.div
          className={`absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] ${
            darkMode ? "bg-red-600/20" : "bg-blue-400/20"
          }`}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full blur-[100px] ${
            darkMode ? "bg-blue-600/20" : "bg-purple-400/20"
          }`}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header with staggered animations */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold tracking-wider border ${
                darkMode
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-blue-500/10 text-blue-600 border-blue-500/20"
              }`}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                ✦
              </motion.span>
              VANTAGENS EXCLUSIVAS
            </span>
          </motion.div>

          <motion.h2
            className={`text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Tudo o que precisas,
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-red-500 dark:from-blue-400 dark:via-purple-400 dark:to-red-400">
              num só lugar.
            </span>
          </motion.h2>

          <motion.p
            className={`text-lg md:text-xl max-w-2xl mx-auto ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            A Appicarta foi desenhada para tornar o teu dia mais fácil, conectando-te
            com o teu correio e com quem mais importa.
          </motion.p>
        </div>

        {/* Features Grid with 3D cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" style={{ perspective: 2000 }}>
          {featuresList.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} darkMode={darkMode} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.div
            className={`inline-flex items-center gap-4 px-8 py-4 rounded-2xl border ${
              darkMode
                ? "bg-gray-800/50 border-gray-700 text-gray-300"
                : "bg-white/70 border-gray-200 text-gray-700"
            } backdrop-blur-sm`}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <Zap className={`w-5 h-5 ${darkMode ? "text-yellow-400" : "text-yellow-500"}`} />
            <span className="font-medium">E muito mais por descobrir...</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
