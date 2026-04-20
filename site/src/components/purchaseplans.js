// src/components/PurchaseHero.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaShoppingCart, 
  FaStar, 
  FaTruck, 
  FaShieldAlt, 
  FaCheck,
  FaArrowLeft,
  FaArrowRight
} from "react-icons/fa";

export default function PurchaseHero({ onDownload, onPurchase }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const productImages = [
    {
      src: "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      alt: "Appicarta App Interface"
    },
    {
      src: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
      alt: "AppiSensor Device"
    },
    {
      src: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80",
      alt: "AppiAlberto Plush Toy"
    },
    {
      src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      alt: "Complete Package"
    }
  ];

  const features = [
    "Notificações em tempo real",
    "AppiSensor físico incluído",
    "Peluche AppiAlberto exclusivo",
    "App para Android e iOS",
    "Suporte premium 24/7",
    "Instalação em 5 minutos"
  ];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const totalPrice = 49 * quantity;

  return (
    <motion.section
      id="purchase-hero"
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Lado Esquerdo - Galeria de Imagens */}
          <motion.div
            className="space-y-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Imagem Principal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700"
              >
                <img
                  src={productImages[selectedImage].src}
                  alt={productImages[selectedImage].alt}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              {/* Navegação de Imagens */}
              <div className="absolute top-1/2 left-4 right-4 flex justify-between transform -translate-y-1/2">
                <button
                  onClick={prevImage}
                  className="w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                >
                  <FaArrowLeft className="text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={nextImage}
                  className="w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                >
                  <FaArrowRight className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* Indicadores */}
              <div className="flex justify-center mt-6 space-x-2">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === selectedImage 
                        ? 'bg-blue-600 w-8' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Miniaturas */}
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    index === selectedImage
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Lado Direito - Informações do Produto */}
          <motion.div
            className="space-y-8"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Cabeçalho */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full">
                  <FaStar className="text-yellow-500 text-sm" />
                  <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">4.8</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">500+ avaliações</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-4">
                Pacote{" "}
                <span className="bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent">
                  Completo
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                A solução definitiva para transformar a tua experiência com o correio. 
                Inclui app premium, sensor físico e peluche exclusivo.
              </p>
            </div>

            {/* Preço e Quantidade */}
            <div className="space-y-6">
              <div className="flex items-end gap-4">
                <div className="text-5xl font-black text-gray-900 dark:text-white">
                  €{totalPrice}
                </div>
                {quantity > 1 && (
                  <div className="text-lg text-gray-500 dark:text-gray-400 line-through">
                    €{49 * quantity}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Quantidade:</span>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">O que inclui:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <FaCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onPurchase}
                className="w-full bg-gradient-to-r from-blue-600 to-red-500 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <FaShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Comprar Agora - €{totalPrice}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDownload}
                className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-lg py-4 px-8 rounded-2xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Experimentar Versão Gratuita
              </motion.button>
            </div>

            {/* Informações de Entrega */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <FaTruck className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-semibold">Entrega Grátis</div>
                  <div>2-3 dias úteis</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <FaShieldAlt className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-semibold">Garantia</div>
                  <div>12 meses</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}