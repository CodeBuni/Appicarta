import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import Hero from "../components/hero";
import FeaturesSection from "../components/features";
import AboutUs from "../components/aboutus";
import Testimonials from "../components/testimonials";
import Footer from "../components/footer";
import LoadingOverlay from "../components/loadingoverlay";
import usePageLoading from "../hooks/usePageLoading";
import AIChat from '../components/aichat';

const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Home() {
  const { loading, showContent } = usePageLoading();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="font-sans text-gray-900 relative overflow-x-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <Navbar />
        <Hero />
        <FeaturesSection />
        <AboutUs />
        <Testimonials />
        <Footer />
        <AIChat />
      </motion.div>

      {/* Overlay de Loading */}
      <LoadingOverlay show={loading} />
    </motion.div>
  );
}
