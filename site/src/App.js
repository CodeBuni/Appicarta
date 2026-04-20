import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/home";
import Purchase from "./pages/purchase";
import Login from "./pages/login";
import Signup from "./pages/signup";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import News from "./pages/news";
import ScrollProgress from "./components/ScrollProgress";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/purchase-success" element={<PurchaseSuccess />} />
        <Route path="/noticias" element={<News />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <>
      <ScrollProgress />
      <AnimatedRoutes />
    </>
  );
}

