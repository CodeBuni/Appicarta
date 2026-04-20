import { motion } from "framer-motion";

export default function LoginHero() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col justify-center items-start h-full px-12"
    >
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-red-500 text-transparent bg-clip-text">
        Bem-vindo à Appicarta
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
        Conecta-te ao teu Arco Familiar e gere as tuas cartas com um toque.  
        Uma experiência moderna, rápida e segura.
      </p>
    </motion.div>
  );
}
