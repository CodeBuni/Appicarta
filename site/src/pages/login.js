import LoginIllustration from "../components/loginillustration";
import LoginForm from "../components/loginform";
import BackArrow from "../components/backarrow";
import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import LoadingOverlay from "../components/loadingoverlay";
import usePageLoading from "../hooks/usePageLoading";

export default function Login() {
  const { loading, showContent } = usePageLoading();
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        className="h-screen w-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 overflow-hidden transition-colors"
      >
        {/* Back Arrow */}
        <BackArrow />
        
        <div className="flex flex-1 lg:flex-row flex-col h-full w-full">
          {/* Coluna da imagem */}
          <div className="lg:w-1/2 h-full">
            <LoginIllustration />
          </div>

          {/* Coluna do formulário */}
          <div className="lg:w-1/2 flex justify-center items-center h-full">
            <LoginForm />
          </div>
        </div>
      </motion.div>
      
      <LoadingOverlay show={loading} />
    </div>
  );
}