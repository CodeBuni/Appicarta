import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useTheme } from "../ThemeContext";
import aboutImg from "../assets/about-img.png";
import { Mail, ShieldCheck, Heart } from "lucide-react";

// Counter animation component
function AnimatedCounter({ value, suffix = "", darkMode }) {
  const [count, setCount] = React.useState(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = parseInt(value);
          const duration = 2000;
          const increment = end / (duration / 16);

          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref} className={`tabular-nums ${darkMode ? "text-white" : "text-gray-900"}`}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function AboutUs() {
  const { darkMode } = useTheme();
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const yImage = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const yText = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const rotateImage = useTransform(scrollYProgress, [0, 1], [-5, 5]);
  const scaleImage = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  const springConfig = { stiffness: 100, damping: 30 };

  // Mouse parallax for image
  const mouseX = React.useRef(0);
  const mouseY = React.useRef(0);
  const smoothMouseX = useSpring(0, springConfig);
  const smoothMouseY = useSpring(0, springConfig);

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.current = x * 20;
    mouseY.current = y * 20;
    smoothMouseX.set(mouseX.current);
    smoothMouseY.set(mouseY.current);
  };

  const handleMouseLeave = () => {
    smoothMouseX.set(0);
    smoothMouseY.set(0);
  };

  const stats = [
    { value: "50000", suffix: "+", label: "Famílias Conectadas" },
    { value: "99", suffix: "%", label: "Satisfação" },
    { value: "24", suffix: "h", label: "Suporte" },
  ];

  return (
    <section
      ref={containerRef}
      id="about"
      className={`relative min-h-screen py-32 overflow-hidden ${darkMode ? "bg-gray-900" : "bg-white"}`}
    >
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Gradient mesh */}
        <motion.div
          className={`absolute inset-0 opacity-30 ${
            darkMode
              ? "bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"
              : "bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]"
          }`}
        />

        {/* Animated dots pattern */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: darkMode
              ? "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)"
              : "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
          animate={{
            backgroundPosition: ["0px 0px", "50px 50px"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text Content */}
          <motion.div
            style={{ y: yText }}
            className="order-2 lg:order-1"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold tracking-wider ${
                  darkMode
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                A NOSSA MISSÃO
              </span>
            </motion.div>

            {/* Title with reveal effect */}
            <div className="overflow-hidden mb-6">
              <motion.h2
                className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                Mais do que correio,
              </motion.h2>
            </div>

            <div className="overflow-hidden mb-8">
              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight"
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-red-500 dark:from-blue-400 dark:via-purple-400 dark:to-red-400">
                  é a tua família conectada.
                </span>
              </motion.h2>
            </div>

            {/* Description paragraphs */}
            <motion.p
              className={`text-lg leading-relaxed mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              A Appicarta nasceu da necessidade de simplificar a gestão do dia-a-dia. Esquece as caixas de correio cheias ou a desorganização familiar.
            </motion.p>

            <motion.p
              className={`text-lg leading-relaxed mb-10 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Acreditamos que a tecnologia deve servir para nos aproximar. Com notificações inteligentes e o sistema de{" "}
              <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Arco Familiar</span>,
              transformamos uma tarefa aborrecida numa experiência partilhada.
            </motion.p>

            {/* Feature cards */}
            <motion.div
              className="grid sm:grid-cols-2 gap-4 mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {[
                { icon: Mail, title: "Centralizado", desc: "Tudo num único ecrã" },
                { icon: Heart, title: "Colaborativo", desc: "Feito para partilhar" },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  className={`p-5 rounded-2xl border ${
                    darkMode
                      ? "bg-gray-800/50 border-gray-700 hover:border-red-500/30"
                      : "bg-white border-gray-200 hover:border-blue-500/30"
                  } transition-all duration-300 group cursor-default`}
                  whileHover={{ y: -5, scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div
                    className={`p-3 rounded-xl w-fit mb-3 ${
                      darkMode
                        ? "bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-white"
                        : "bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white"
                    } transition-all duration-300`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h4 className={`font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{item.title}</h4>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              className={`grid grid-cols-3 gap-6 p-6 rounded-2xl ${
                darkMode ? "bg-gray-800/50" : "bg-gray-50"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                >
                  <div className="text-3xl md:text-4xl font-black mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} darkMode={darkMode} />
                  </div>
                  <div className={`text-xs md:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image Section */}
          <motion.div
            ref={imageRef}
            className="order-1 lg:order-2 relative"
            style={{ y: yImage }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              className="relative w-full max-w-lg mx-auto"
              style={{
                rotateX: useTransform(smoothMouseY, [-100, 100], [-10, 10]),
                rotateY: useTransform(smoothMouseX, [-100, 100], [10, -10]),
                transformPerspective: 1000,
              }}
            >
              {/* Background glow */}
              <motion.div
                className={`absolute -inset-8 rounded-[3rem] blur-3xl opacity-50 ${
                  darkMode ? "bg-red-500/20" : "bg-blue-500/20"
                }`}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              {/* Main image container */}
              <motion.div
                className={`relative rounded-[2.5rem] overflow-hidden shadow-2xl ${
                  darkMode ? "shadow-red-500/10" : "shadow-blue-500/20"
                }`}
                style={{ scale: scaleImage, rotate: rotateImage }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.img
                  src={aboutImg}
                  alt="Sobre a Appicarta"
                  className="w-full h-auto"
                  initial={{ scale: 1.2 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Animated border */}
                <motion.div
                  className="absolute inset-0 rounded-[2.5rem] border-2 border-white/20 pointer-events-none"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>

              {/* Floating badge */}
              <motion.div
                className={`absolute -bottom-6 -left-6 px-6 py-4 rounded-2xl shadow-xl ${
                  darkMode
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-100"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
                style={{
                  x: smoothMouseX,
                  y: smoothMouseY,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <motion.div
                      className={`absolute inset-0 rounded-full ${darkMode ? "bg-red-500" : "bg-green-500"}`}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className={`w-3 h-3 rounded-full relative ${darkMode ? "bg-red-500" : "bg-green-500"}`} />
                  </div>
                  <span className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Sistema Activo</span>
                </div>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                className={`absolute -top-4 -right-4 w-20 h-20 rounded-2xl ${
                  darkMode ? "bg-red-500/10" : "bg-blue-500/10"
                } backdrop-blur-sm border ${darkMode ? "border-red-500/20" : "border-blue-500/20"}`}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 10, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
