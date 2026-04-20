import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignupForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col justify-center items-center w-full max-w-sm px-8"
    >
      <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-red-500 text-transparent bg-clip-text text-center">
        Criar Conta
      </h2>

      <form className="w-full space-y-4">
        <input
          type="text"
          placeholder="Nome completo"
          className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Palavra-passe"
            className="w-full p-3 pr-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
          >
            {showPassword ? <FaEye className="w-5 h-5" /> : <FaEyeSlash className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar palavra-passe"
            className="w-full p-3 pr-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
          >
            {showConfirmPassword ? <FaEye className="w-5 h-5" /> : <FaEyeSlash className="w-5 h-5" />}
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full mt-2 bg-gradient-to-r from-blue-500 to-red-500 text-white font-semibold py-3 rounded-xl hover:scale-[1.02] transition-transform"
        >
          Criar Conta
        </button>
      </form>

      <p className="text-gray-500 dark:text-gray-400 text-sm mt-8 text-center w-full">
        Já tens conta?{" "}
        <Link
          to="/login"
          className="text-blue-500 hover:underline hover:text-red-500 transition"
        >
          Inicia sessão
        </Link>
      </p>
    </motion.div>
  );
}