import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  FaInstagram, FaFacebookF, FaLinkedinIn, FaTwitter, FaYoutube,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowRight, FaHeart,
  FaMobileAlt, FaGlobe, FaShieldAlt
} from 'react-icons/fa';
import { SiAppstore, SiGoogleplay } from 'react-icons/si';
import { useTheme } from '../ThemeContext';

export default function Footer() {
  const { darkMode } = useTheme();
  const currentYear = new Date().getFullYear();
  const footerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

  const socialLinks = [
    { icon: FaInstagram, href: "#", color: "hover:text-pink-400", label: "Instagram" },
    { icon: FaFacebookF, href: "#", color: "hover:text-blue-400", label: "Facebook" },
    { icon: FaLinkedinIn, href: "#", color: "hover:text-blue-600", label: "LinkedIn" },
    { icon: FaTwitter, href: "#", color: "hover:text-sky-400", label: "Twitter" },
    { icon: FaYoutube, href: "#", color: "hover:text-red-500", label: "YouTube" },
  ];

  const quickLinks = [
    { name: "Sobre Nós", href: "#about" },
    { name: "Funcionalidades", href: "#features" },
    { name: "Notícias", href: "/noticias" },
    { name: "Preços", href: "/purchase" },
  ];

  const supportLinks = [
    { name: "Centro de Ajuda", href: "#" },
    { name: "Contacte-nos", href: "#" },
    { name: "Política de Privacidade", href: "#" },
    { name: "Termos de Serviço", href: "#" },
  ];

  const features = [
    { icon: FaShieldAlt, text: "Segurança Garantida" },
    { icon: FaMobileAlt, text: "App Móvel" },
    { icon: FaGlobe, text: "Disponível Globalmente" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <footer
      ref={footerRef}
      className={`relative overflow-hidden ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900"
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]"
          animate={{
            x: [0, -80, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10"
      >
        {/* Newsletter Section */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={`rounded-3xl p-8 md:p-12 ${
                darkMode
                  ? "bg-gradient-to-r from-red-600/20 to-blue-600/20 border border-white/10"
                  : "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10"
              } backdrop-blur-sm`}
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <motion.h3
                    className="text-2xl md:text-3xl font-bold text-white mb-3"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    Fica atualizado
                  </motion.h3>
                  <motion.p
                    className="text-white/70"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    Subscreve a nossa newsletter para receber as últimas novidades.
                  </motion.p>
                </div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <input
                    type="email"
                    placeholder="O teu email"
                    className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 transition-colors"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    Subscrever
                    <FaArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto px-6 py-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Company Info */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <motion.h3
                className="text-2xl font-bold mb-6 text-white"
                whileHover={{ scale: 1.05 }}
              >
                Appicarta
              </motion.h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Transformando a forma como as famílias portuguesas gerem o seu correio e comunicação.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 text-white/70"
                    whileHover={{ x: 5, color: "#fff" }}
                    transition={{ duration: 0.2 }}
                  >
                    <feature.icon className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center text-white/70 transition-all duration-300 ${social.color} hover:bg-white/20 border border-white/10`}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-6 text-white">Links Rápidos</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      <FaArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-6 text-white">Suporte</h4>
              <ul className="space-y-3">
                {supportLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      <FaArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact & Download */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-6 text-white">Contactos</h4>

              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                {[
                  { icon: FaMapMarkerAlt, text: "Porto, Portugal", color: "text-red-400" },
                  { icon: FaPhone, text: "+351 912 345 678", color: "text-green-400" },
                  { icon: FaEnvelope, text: "geral@appicarta.pt", color: "text-yellow-400" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 text-white/70"
                    whileHover={{ x: 3 }}
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* App Downloads */}
              <div className="space-y-3">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 flex items-center justify-center gap-3 hover:bg-white/20 transition-all duration-300 group"
                >
                  <SiAppstore className="w-6 h-6 text-white" />
                  <div className="text-left">
                    <div className="text-xs text-white/60">Download na</div>
                    <div className="text-sm font-semibold text-white">App Store</div>
                  </div>
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 flex items-center justify-center gap-3 hover:bg-white/20 transition-all duration-300 group"
                >
                  <SiGoogleplay className="w-6 h-6 text-white" />
                  <div className="text-left">
                    <div className="text-xs text-white/60">Disponível no</div>
                    <div className="text-sm font-semibold text-white">Google Play</div>
                  </div>
                </motion.a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="border-t border-white/10"
        >
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.div
              className="flex items-center gap-2 text-white/60 text-sm"
              whileHover={{ color: "rgba(255,255,255,0.9)" }}
            >
              <span>© {currentYear} Appicarta. Todos os direitos reservados.</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <FaHeart className="w-4 h-4 text-red-400" />
              </motion.span>
            </motion.div>

            <div className="flex gap-6 text-sm">
              {["Privacidade", "Termos", "Cookies", "Mapa do Site"].map((link) => (
                <motion.a
                  key={link}
                  href="#"
                  className="text-white/60 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
