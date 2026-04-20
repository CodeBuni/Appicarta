import { motion } from "framer-motion";
import illustration from "../assets/login-illustration.jpg"; // substitui pela tua imagem

export default function LoginIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full h-full overflow-hidden"
    >
      <img
        src={illustration}
        alt="Ilustração de login"
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}
