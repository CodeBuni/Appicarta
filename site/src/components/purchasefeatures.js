// src/components/PurchaseFeatures.js
import React from "react";
import { motion } from "framer-motion";
import { 
  FaBell, 
  FaShieldAlt, 
  FaRocket, 
  FaMobileAlt,
  FaSyncAlt,
  FaUserShield,
  FaCloud,
  FaWifi
} from "react-icons/fa";

export default function PurchaseFeatures() {
  const features = [
    {
      icon: FaBell,
      title: "Notificações Instantâneas",
      description: "Recebe alertas em tempo real assim que chega correio à tua caixa",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      delay: 0.1
    },
    {
      icon: FaShieldAlt,
      title: "Privacidade Total",
      description: "Dados 100% encriptados e armazenados localmente no teu dispositivo",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      delay: 0.2
    },
    {
      icon: FaRocket,
      title: "Instalação Rápida",
      description: "Configuração em menos de 5 minutos - liga e começa a usar",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      delay: 0.3
    },
    {
      icon: FaMobileAlt,
      title: "Multiplataforma",
      description: "Funciona perfeitamente em Android e iOS com sincronização em nuvem",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      delay: 0.4
    },
    {
      icon: FaSyncAlt,
      title: "Sincronização Contínua",
      description: "Mantém todos os teus dispositivos atualizados automaticamente",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      delay: 0.5
    },
    {
      icon: FaUserShield,
      title: "Acesso Seguro",
      description: "Controlo de permissões granular para partilha familiar segura",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      delay: 0.6
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="min-h-screen relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 dark:bg-blue-800 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-200 dark:bg-red-800 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-7xl w-full">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 mb-6 shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tecnologia Avançada
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6">
            Descobre o Poder do{" "}
            <span className="bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent">
              AppiSensor
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Uma experiência completa de monitorização de correio que combina hardware inteligente 
            com software avançado para te manter sempre informado.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                transition: { type: "spring", stiffness: 300 }
              }}
              className={`group relative p-8 rounded-3xl backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-500 ${feature.bgColor}`}
            >
              {/* Background Gradient Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
              
              {/* Icon Container */}
              <motion.div
                className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </motion.div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>

              {/* Hover Border Effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}>
                <div className="absolute inset-[2px] rounded-3xl bg-white dark:bg-gray-800"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Pronto para Revolucionar o Teu Correio?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              Junta-te a milhares de utilizadores que já transformaram a sua experiência com o AppiSensor.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}