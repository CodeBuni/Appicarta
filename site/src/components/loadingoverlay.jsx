import { motion } from "framer-motion";
import alverto from "../assets/appialberto.png"; // substitui pela tua imagem

export default function LoadingOverlay({ show }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: show ? 1 : 0 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      className={`fixed inset-0 z-[9999] flex justify-center items-center
        ${show ? 'pointer-events-auto' : 'pointer-events-none'}
        dark:bg-gray-900 bg-white`}
    >
      <motion.img
        src={alverto}
        alt="AppiAlverto a girar"
        className="w-32 h-32"
        loading="eager"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={show ? {
          opacity: 1,
          scale: 1,
          rotate: 360,
          y: [0, -20, 0],
          scale: [1, 1.2, 1]
        } : {
          opacity: 0,
          scale: 0.8
        }}
        transition={{ 
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 },
          rotate: { repeat: Infinity, duration: 0.8, ease: "linear" },
          y: { repeat: Infinity, duration: 0.8, ease: "easeInOut" }
        }}
      />
    </motion.div>
  );
}
