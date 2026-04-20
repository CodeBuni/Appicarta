import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaQuoteLeft, FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import { useTheme } from "../ThemeContext";

const feedbacks = [
  { name: "Maria Silva", role: "Mãe de família", text: "A Appicarta facilitou imenso a minha vida! Agora consigo organizar o correio da família inteira sem stress e de forma muito intuitiva.", rating: 5, avatar: "https://i.pravatar.cc/150?u=maria" },
  { name: "João Martins", role: "Estudante", text: "Comunicar com a família nunca foi tão simples. Adoro receber notificações instantâneas do correio! É o futuro.", rating: 5, avatar: "https://i.pravatar.cc/150?u=joao" },
  { name: "Ana Pires", role: "Gestora", text: "A facilidade de uso da interface é formidável. Sinto-me mais próxima da minha família e nunca mais perdi correspondência importante.", rating: 5, avatar: "https://i.pravatar.cc/150?u=ana" },
  { name: "Carlos Ferreira", role: "Pensionista", text: "A Appicarta trouxe organização e eficiência ao meu dia-a-dia. Recomendo a todos pela sua simplicidade.", rating: 4, avatar: "https://i.pravatar.cc/150?u=carlos" },
  { name: "Sofia Costa", role: "Arquiteta", text: "O Arco Familiar é incrível! O design da app é moderno e agora todos estamos sempre informados, mesmo à distância.", rating: 5, avatar: "https://i.pravatar.cc/150?u=sofia" },
];

export default function Testimonials() {
  const { darkMode } = useTheme();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % feedbacks.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.9,
      rotateY: dir > 0 ? 15 : -15
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: { duration: 0.6, type: "spring", bounce: 0.3 }
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.9,
      rotateY: dir > 0 ? -15 : 15,
      transition: { duration: 0.5 }
    })
  };

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % feedbacks.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
  };

  return (
    <section id="testimonials" className="relative min-h-screen py-24 flex flex-col justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-700 overflow-hidden px-6">
      
      {/* Background with abstract glowing shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className={`absolute top-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-20 ${darkMode ? "bg-red-600" : "bg-blue-400"}`}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className={`absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] rounded-full blur-[100px] opacity-20 ${darkMode ? "bg-purple-600" : "bg-green-400"}`}
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`inline-block py-1 px-3 rounded-full text-sm font-semibold tracking-wider mb-4 ${darkMode ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-600"}`}
          >
            TESTEMUNHOS REAIS
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight"
          >
            A opinião de quem confia em nós
          </motion.h2>
        </div>

        {/* Carousel Area */}
        <div className="relative w-full max-w-4xl mx-auto focus:outline-none" style={{ perspective: "1200px" }}>
          
          <div className="relative h-[400px] md:h-[350px] flex items-center justify-center">
            
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className={`absolute w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-10 md:p-14 rounded-3xl shadow-2xl backdrop-blur-xl border ${
                  darkMode ? "bg-gray-900/80 border-gray-800 shadow-black/50" : "bg-white border-gray-100 shadow-blue-900/10"
                }`}
              >
                <FaQuoteLeft className={`text-4xl md:text-5xl mb-6 opacity-20 absolute top-8 left-8 ${darkMode ? "text-red-400" : "text-blue-500"}`} />
                
                <p className="text-xl md:text-2xl font-medium text-center text-gray-700 dark:text-gray-200 leading-relaxed mb-8 relative z-10">
                  "{feedbacks[current].text}"
                </p>
                
                <div className="flex flex-col items-center">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <FaStar
                        key={idx}
                        className={`${
                          idx < feedbacks[current].rating
                            ? "text-yellow-400"
                            : "text-gray-300 dark:text-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <img 
                      src={feedbacks[current].avatar} 
                      alt={feedbacks[current].name}
                      className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 shadow-md"
                    />
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 dark:text-white">{feedbacks[current].name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{feedbacks[current].role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Navigation Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 md:-px-10 z-20 pointer-events-none">
            <motion.button
              onClick={handlePrev}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`pointer-events-auto p-4 rounded-full shadow-lg backdrop-blur-md border border-white/20 transition-colors ${
                darkMode ? "bg-gray-800/80 text-white hover:bg-red-500 hover:border-red-500" : "bg-white/80 text-gray-900 hover:bg-blue-600 hover:text-white"
              }`}
            >
              <FaChevronLeft className="text-lg" />
            </motion.button>
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`pointer-events-auto p-4 rounded-full shadow-lg backdrop-blur-md border border-white/20 transition-colors ${
                darkMode ? "bg-gray-800/80 text-white hover:bg-red-500 hover:border-red-500" : "bg-white/80 text-gray-900 hover:bg-blue-600 hover:text-white"
              }`}
            >
              <FaChevronRight className="text-lg" />
            </motion.button>
          </div>

        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-8 gap-3">
          {feedbacks.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > current ? 1 : -1);
                setCurrent(idx);
              }}
              className="py-2 px-1 focus:outline-none group"
            >
              <motion.div
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current 
                    ? darkMode ? "w-8 bg-red-500" : "w-8 bg-blue-600" 
                    : darkMode ? "w-2 bg-gray-700 group-hover:bg-gray-500" : "w-2 bg-gray-300 group-hover:bg-gray-400"
                }`}
              />
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
