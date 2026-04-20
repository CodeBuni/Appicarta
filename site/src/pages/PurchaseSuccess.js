// src/pages/PurchaseSuccess.js
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { FaCheckCircle, FaEnvelope, FaHome, FaWhatsapp } from 'react-icons/fa';

export default function PurchaseSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Aqui podes integrar com analytics para tracking de conversão
    console.log('Compra concluída com sucesso!');
  }, []);

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 text-center border border-gray-200 dark:border-gray-700"
          >
            {/* Ícone de sucesso */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6"
            >
              <FaCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </motion.div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Compra Confirmada! 🎉
            </h1>

            {/* Mensagem */}
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Obrigado por escolheres a AppiCarta. O teu AppiSensor está a caminho!
            </p>

            {/* Detalhes da encomenda */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-8 text-left">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                Detalhes da Encomenda
              </h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Nº de Encomenda:</span>
                  <span className="text-gray-900 dark:text-white font-medium">#APPI-{Math.floor(Math.random() * 10000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Data:</span>
                  <span className="text-gray-900 dark:text-white">{new Date().toLocaleDateString('pt-PT')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Previsão de Entrega:</span>
                  <span className="text-gray-900 dark:text-white">2-3 dias úteis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pagamento:</span>
                  <span className="text-gray-900 dark:text-white">Confirmado</span>
                </div>
              </div>
            </div>

            {/* Próximos passos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                <FaEnvelope className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Confirmação por Email</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receberás um email com todos os detalhes da tua encomenda
                </p>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                <FaHome className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Preparar Instalação</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Descarrega a app e prepara a tua caixa de correio
                </p>
              </div>
            </div>

            {/* Links de ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Voltar ao Início
              </button>
              
              <a
                href="https://wa.me/351912345678"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl shadow-lg hover:bg-green-600 transition-all inline-flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="w-5 h-5" />
                <span>Suporte via WhatsApp</span>
              </a>
            </div>

            {/* Nota de download */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-8">
              Não te esqueças de descarregar a AppiCarta na App Store ou Google Play para configurares o teu sensor assim que chegar.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}