// src/components/PurchaseHero.js
import React from "react";
import { motion } from "framer-motion";
import { FaDownload, FaShoppingCart, FaMobile, FaStar } from "react-icons/fa";

export default function PurchaseHero({ onDownload, onPurchase }) {
  return (
    <motion.section
      id="purchase-hero"
      className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-red-50 dark:from-gray-900 dark:via-blue-900 dark:to-red-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Circulos decorativos */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-200 dark:bg-red-800 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Linhas de gradiente */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.1)_0%,transparent_50%)]" />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge de avaliação */}
        <motion.div
          className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <FaStar className="text-yellow-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            4.8 ★ Avaliação na App Store
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 text-gray-900 dark:text-white tracking-tight"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <span className="bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
            Appicarta
          </span>
        </motion.h1>

        <motion.p
          className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200 leading-tight"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Mais inteligência para o teu{" "}
          <span className="text-blue-600 dark:text-blue-400">correio</span>
        </motion.p>

        <motion.p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 text-gray-600 dark:text-gray-400 leading-relaxed"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          A aplicação que transforma a tua caixa de correio. 
          <span className="font-semibold text-blue-600 dark:text-red-400"> Grátis para sempre</span> ou 
          upgrade com o <span className="font-semibold text-red-600 dark:text-red-400">AppiSensor</span> para notificações em tempo real.
        </motion.p>

        {/* Botões principais */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onDownload}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 min-w-[200px] justify-center"
          >
            <FaDownload className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Baixar Grátis
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(239, 68, 68, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onPurchase}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 min-w-[200px] justify-center"
          >
            <FaShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Comprar AppiSensor
          </motion.button>
        </motion.div>

        {/* Features rápidas */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 text-sm text-gray-600 dark:text-gray-400"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <div className="flex items-center gap-2">
            <FaMobile className="w-4 h-4 text-blue-500" />
            <span>Android & iOS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Instalação em 30s</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Sem anúncios</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Suporte 24/7</span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}