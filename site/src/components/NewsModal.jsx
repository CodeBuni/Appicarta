import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../ThemeContext";
import { FaTimes, FaCalendarAlt, FaTag, FaShare, FaBookmark, FaHeart } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function NewsModal({ news, isOpen, onClose }) {
  const { darkMode } = useTheme();
  const [showContent, setShowContent] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 600);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!news) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 perspective-1000">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl"
            >
              {/* Envelope Container */}
              <div className="relative">
                {/* Envelope Back (behind the letter) */}
                <motion.div
                  initial={{ rotateX: 0 }}
                  animate={{ rotateX: showContent ? -180 : 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  style={{ transformOrigin: "top", transformStyle: "preserve-3d" }}
                  className={`absolute inset-0 rounded-t-3xl h-32 z-10 ${
                    darkMode
                      ? "bg-gradient-to-b from-gray-700 to-gray-800"
                      : "bg-gradient-to-b from-blue-400 to-blue-600"
                  }`}
                >
                  {/* Envelope flap decoration */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                        darkMode ? "bg-gray-600" : "bg-white/20"
                      }`}
                    >
                      <span className="text-2xl">✉️</span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* The Letter (News Content) */}
                <motion.div
                  initial={{ y: 0, scale: 0.95 }}
                  animate={{
                    y: showContent ? -20 : 60,
                    scale: showContent ? 1 : 0.95,
                    rotateX: showContent ? 0 : 10,
                  }}
                  transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className={`relative rounded-2xl shadow-2xl overflow-hidden ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  {/* Letter Header Image */}
                  <div className="relative h-64 overflow-hidden">
                    <motion.img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />

                    {/* Category Badge */}
                    <motion.div
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="absolute top-4 left-4"
                    >
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm ${
                        darkMode
                          ? "bg-red-500/90 text-white"
                          : "bg-blue-600/90 text-white"
                      }`}>
                        {news.category}
                      </span>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ y: -30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="absolute top-4 right-4 flex gap-2"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                          isBookmarked
                            ? "bg-yellow-500 text-white"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        <FaBookmark className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
                      >
                        <FaShare className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
                      >
                        <FaTimes className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* Letter Content */}
                  <div className={`p-8 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {/* Date */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      className={`flex items-center gap-2 mb-4 text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <FaCalendarAlt />
                      {news.date}
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="text-3xl md:text-4xl font-black mb-6 leading-tight"
                    >
                      {news.title}
                    </motion.h2>

                    {/* Excerpt */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className={`text-lg mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {news.excerpt}
                    </motion.p>

                    {/* Full Content */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      className={`space-y-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {news.content?.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="leading-relaxed">{paragraph}</p>
                      )) || <p>{news.content}</p>}
                    </motion.div>

                    {/* Like Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 }}
                      className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsLiked(!isLiked)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all ${
                          isLiked
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                            : darkMode
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <motion.div
                          animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <FaHeart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                        </motion.div>
                        {isLiked ? "Gostaste disto!" : "Gostas disto?"}
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* Paper texture overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.02]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                  />
                </motion.div>

                {/* Envelope Body (bottom part) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`h-24 rounded-b-3xl shadow-xl ${
                    darkMode
                      ? "bg-gradient-to-b from-gray-800 to-gray-900"
                      : "bg-gradient-to-b from-blue-500 to-blue-700"
                  }`}
                >
                  {/* Envelope V-shape decoration */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
                    <div
                      className={`absolute bottom-0 left-0 w-1/2 h-full transform skew-y-6 origin-bottom-left ${
                        darkMode ? "bg-gray-700/50" : "bg-blue-400/30"
                      }`}
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-1/2 h-full transform -skew-y-6 origin-bottom-right ${
                        darkMode ? "bg-gray-700/50" : "bg-blue-400/30"
                      }`}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Close hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-center text-white/60 text-sm mt-4"
              >
                Pressiona ESC ou clica fora para fechar
              </motion.p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
