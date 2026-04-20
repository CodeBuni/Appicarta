// src/pages/Purchase.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { 
  FaShieldAlt, FaBolt, FaWifi, FaBatteryFull, 
  FaCheck, FaTruck, FaCreditCard, FaLock, 
  FaGooglePay, FaApplePay, FaPaypal, FaCcVisa, 
  FaCcMastercard, FaCcAmex, FaArrowLeft, FaBox,
  FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone,
  FaRegClock, FaStar, FaWhatsapp
} from 'react-icons/fa';
import { FaMobileAlt } from 'react-icons/fa';

// Imagens do produto (imports - substituir pelos caminhos corretos)
import appisensorMain from '../assets/img1.jpeg';
import appisensorSide from '../assets/img3.jpeg';
import appisensorOpen from '../assets/img5.jpeg';
import appisensorBox from '../assets/img4.jpeg';
import appisensorInstall from '../assets/img2.jpeg';

export default function Purchase() {
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState('light');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Dados pessoais
    nome: '',
    email: '',
    telefone: '',
    nif: '',
    
    // Morada
    morada: '',
    cidade: '',
    codigoPostal: '',
    pais: 'Portugal',
    
    // Dados de pagamento (cartão)
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    
    // Preferências
    newsletter: true,
    termos: false,
    instalacaoAssistida: false
  });

  // Preços
  const prices = {
    sensor: 49.90,
    shipping: 3.90,
    shippingFree: 59.90
  };

  // Detectar tema atual
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setCurrentTheme(isDark ? 'dark' : 'light');
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Imagens do produto
  const productImages = [
    { src: appisensorMain, alt: 'AppiSensor - Vista Principal', caption: 'Design Elegante e Compacto' },
    { src: appisensorSide, alt: 'AppiSensor - Vista Lateral', caption: 'Visual Simples e Moderno' },
    { src: appisensorOpen, alt: 'AppiSensor - Detalhes', caption: 'Praticidade e Facilidade de Uso' },
    { src: appisensorBox, alt: 'AppiSensor - Embalagem', caption: 'Sensores de Alta Qualidade' },
    { src: appisensorInstall, alt: 'AppiSensor - Instalação', caption: 'Material Profissional e Qualificado' }
  ];

  // Benefícios do produto
  const benefits = [
    { icon: FaBolt, title: 'Bateria de Longa Duração', desc: 'Até 12 meses com uma única pilha' },
    { icon: FaWifi, title: 'Conexão Instantânea', desc: 'Wi-Fi de baixo consumo integrado' },
    { icon: FaShieldAlt, title: 'Criptografia de Ponta', desc: 'Dados protegidos com segurança militar' },
    { icon: FaBatteryFull, title: 'Baixo Consumo', desc: 'Tecnologia de ultra baixo consumo' }
  ];

  // Avaliações de clientes
  const reviews = [
    { name: 'Joana Silva', rating: 5, comment: 'Instalação super fácil, funciona perfeitamente!', date: '2 dias atrás' },
    { name: 'Pedro Santos', rating: 5, comment: 'Já não perco correspondência importante.', date: '1 semana atrás' },
    { name: 'Maria Costa', rating: 5, comment: 'A app é fantástica, recomendo a todos!', date: '2 semanas atrás' }
  ];

  // Calcular totais
  const subtotal = prices.sensor * selectedQuantity;
  const shipping = subtotal >= prices.shippingFree ? 0 : prices.shipping;
  const total = subtotal + shipping;

  // Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuantityChange = (increment) => {
    setSelectedQuantity(prev => {
      const newValue = increment ? prev + 1 : prev - 1;
      return Math.max(1, Math.min(5, newValue));
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Processar pagamento
      console.log('Processando pagamento...', formData);
      // Aqui viria a integração com gateway de pagamento
      navigate('/purchase-success');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  // Formatação de inputs
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb e Voltar */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
            >
              <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar</span>
            </button>
            
            <div className="flex items-center gap-2 text-sm">
              <span className={step >= 1 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400'}>1. Produto</span>
              <span className="text-gray-300 dark:text-gray-600">→</span>
              <span className={step >= 2 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400'}>2. Entrega</span>
              <span className="text-gray-300 dark:text-gray-600">→</span>
              <span className={step >= 3 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400'}>3. Pagamento</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Principal - Formulário */}
            <div className="lg:col-span-2">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700"
              >
                {/* Step 1: Escolha do Produto */}
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Escolhe o teu AppiSensor
                    </h2>

                    {/* Galeria de Imagens */}
                    <div className="mb-8">
                      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden mb-4">
                        <motion.img
                          key={currentImageIndex}
                          src={productImages[currentImageIndex].src}
                          alt={productImages[currentImageIndex].alt}
                          className="w-full h-full object-contain p-8"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                        
                        {/* Navegação das imagens */}
                        <button
                          onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : productImages.length - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev => (prev < productImages.length - 1 ? prev + 1 : 0))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors"
                        >
                          →
                        </button>
                      </div>

                      {/* Miniaturas */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {productImages.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                              currentImageIndex === index
                                ? 'border-blue-500 scale-105'
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>

                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {productImages[currentImageIndex].caption}
                      </p>
                    </div>

                    {/* Benefícios */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="text-center">
                          <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                            <benefit.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{benefit.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{benefit.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Quantidade */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Quantidade
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleQuantityChange(false)}
                          className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                          disabled={selectedQuantity <= 1}
                        >
                          -
                        </button>
                        <span className="text-xl font-bold text-gray-900 dark:text-white w-12 text-center">
                          {selectedQuantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(true)}
                          className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                          disabled={selectedQuantity >= 5}
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedQuantity >= 5 ? 'Máx. 5 unidades' : 'Máx. 5 por cliente'}
                        </span>
                      </div>
                    </div>

                    {/* Opção de instalação assistida */}
                    <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="instalacaoAssistida"
                          checked={formData.instalacaoAssistida}
                          onChange={handleInputChange}
                          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Instalação Assistida +9.90€
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Recebe assistência por videochamada para instalar o sensor. Ideal para quem quer garantir que tudo fica perfeito.
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Avaliações rápidas */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          4.9 · 2.347 avaliações
                        </span>
                      </div>
                      <div className="space-y-3">
                        {reviews.map((review, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <div className="flex text-yellow-400">
                              {[...Array(review.rating)].map((_, i) => (
                                <FaStar key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{review.name}</span>
                            <span className="text-gray-500 dark:text-gray-400">·</span>
                            <span className="text-gray-500 dark:text-gray-400">{review.comment}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Dados de Entrega */}
                {step === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Dados de Entrega
                    </h2>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome Completo *
                          </label>
                          <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              name="nome"
                              value={formData.nome}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="João Silva"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email *
                          </label>
                          <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="joao@email.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Telefone *
                          </label>
                          <div className="relative">
                            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="tel"
                              name="telefone"
                              value={formData.telefone}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="912345678"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            NIF (opcional)
                          </label>
                          <input
                            type="text"
                            name="nif"
                            value={formData.nif}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="123456789"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Morada *
                        </label>
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            name="morada"
                            value={formData.morada}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Rua Principal, 123"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cidade *
                          </label>
                          <input
                            type="text"
                            name="cidade"
                            value={formData.cidade}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Lisboa"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Código Postal *
                          </label>
                          <input
                            type="text"
                            name="codigoPostal"
                            value={formData.codigoPostal}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="1000-001"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          País *
                        </label>
                        <select
                          name="pais"
                          value={formData.pais}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option>Portugal</option>
                          <option>Espanha</option>
                          <option>França</option>
                          <option>Itália</option>
                          <option>Alemanha</option>
                        </select>
                      </div>

                      <div className="pt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="newsletter"
                            checked={formData.newsletter}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Quero receber novidades e promoções por email
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Pagamento */}
                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Método de Pagamento
                    </h2>

                    {/* Métodos de pagamento */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <button
                        onClick={() => setSelectedPayment('card')}
                        className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                          selectedPayment === 'card'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <FaCreditCard className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        <span className="text-xs font-medium">Cartão</span>
                      </button>

                      <button
                        onClick={() => setSelectedPayment('mbway')}
                        className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                          selectedPayment === 'mbway'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <FaMobileAlt className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        <span className="text-xs font-medium">MB WAY</span>
                      </button>

                      <button
                        onClick={() => setSelectedPayment('paypal')}
                        className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                          selectedPayment === 'paypal'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <FaPaypal className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        <span className="text-xs font-medium">PayPal</span>
                      </button>
                    </div>

                    {/* Formulário de Cartão */}
                    {selectedPayment === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Número do Cartão *
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-1">
                              <FaCcVisa className="w-5 h-5 text-gray-400" />
                              <FaCcMastercard className="w-5 h-5 text-gray-400" />
                              <FaCcAmex className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                cardNumber: formatCardNumber(e.target.value)
                              }))}
                              maxLength="19"
                              placeholder="1234 5678 9012 3456"
                              className="w-full pl-24 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome no Cartão *
                          </label>
                          <input
                            type="text"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            placeholder="JOÃO SILVA"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Validade *
                            </label>
                            <input
                              type="text"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                cardExpiry: formatExpiry(e.target.value)
                              }))}
                              maxLength="5"
                              placeholder="MM/AA"
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              CVV *
                            </label>
                            <input
                              type="password"
                              name="cardCvv"
                              value={formData.cardCvv}
                              onChange={handleInputChange}
                              maxLength="4"
                              placeholder="123"
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MB WAY */}
                    {selectedPayment === 'mbway' && (
                      <div className="text-center py-8">
                        <FaMobileAlt className="w-16 h-16 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Vais receber um pedido de confirmação na app MB WAY
                        </p>
                        <input
                          type="tel"
                          placeholder="Número de telemóvel"
                          className="w-full max-w-xs mx-auto px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* PayPal */}
                    {selectedPayment === 'paypal' && (
                      <div className="text-center py-8">
                        <FaPaypal className="w-16 h-16 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Serás redirecionado para o PayPal após confirmares a compra
                        </p>
                      </div>
                    )}

                    {/* Termos e condições */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="termos"
                          checked={formData.termos}
                          onChange={handleInputChange}
                          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Li e aceito os{' '}
                          <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Termos e Condições
                          </a>{' '}
                          e a{' '}
                          <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Política de Privacidade
                          </a>
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Coluna Lateral - Resumo da Compra */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Resumo da Encomenda
                </h3>

                {/* Produto */}
                <div className="flex gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={appisensorMain} alt="AppiSensor" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">AppiSensor</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Qtd: {selectedQuantity}</p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {subtotal.toFixed(2)}€
                    </p>
                  </div>
                </div>

                {/* Instalação Assistida */}
                {formData.instalacaoAssistida && (
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-600 dark:text-gray-400">Instalação Assistida</span>
                    <span className="text-gray-900 dark:text-white font-medium">9.90€</span>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">{subtotal.toFixed(2)}€</span>
                </div>

                {/* Portes */}
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Portes de Envio</span>
                  <span className="text-gray-900 dark:text-white">
                    {shipping === 0 ? 'Grátis' : `${shipping.toFixed(2)}€`}
                  </span>
                </div>

                {/* Desconto se aplicável */}
                {subtotal >= prices.shippingFree && (
                  <div className="flex justify-between text-sm mb-2 text-green-600 dark:text-green-400">
                    <span>Desconto (Portes Grátis)</span>
                    <span>-{prices.shipping.toFixed(2)}€</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-blue-600 dark:text-blue-400">{total.toFixed(2)}€</span>
                </div>

                {/* Progresso para portes grátis */}
                {subtotal < prices.shippingFree && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Faltam {(prices.shippingFree - subtotal).toFixed(2)}€ para portes grátis
                    </p>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-red-500 rounded-full"
                        style={{ width: `${(subtotal / prices.shippingFree) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Botão de ação */}
                <button
                  onClick={handleSubmit}
                  disabled={step === 3 && !formData.termos}
                  className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {step === 3 ? 'Confirmar Pagamento' : step === 2 ? 'Continuar para Pagamento' : 'Continuar para Entrega'}
                </button>

                {/* Selos de segurança */}
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <FaLock className="w-3 h-3" />
                    <span>Pagamento Seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaRegClock className="w-3 h-3" />
                    <span>Entrega 2-3 dias</span>
                  </div>
                </div>

                {/* Métodos de pagamento aceites */}
                <div className="mt-4 flex justify-center gap-2">
                  <FaCcVisa className="w-8 h-8 text-gray-400" />
                  <FaCcMastercard className="w-8 h-8 text-gray-400" />
                  <FaCcAmex className="w-8 h-8 text-gray-400" />
                  <FaMobileAlt className="w-8 h-8 text-gray-400" />
                  <FaPaypal className="w-8 h-8 text-gray-400" />
                </div>

                {/* Suporte rápido */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Precisas de ajuda?
                  </p>
                  <a 
                    href="https://wa.me/351912345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    <span>Fala connosco no WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}