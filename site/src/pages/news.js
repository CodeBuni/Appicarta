import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "../ThemeContext";
import {
  FaCalendarAlt,
  FaArrowRight,
  FaTag,
  FaSearch,
  FaChevronRight,
  FaEnvelope,
} from "react-icons/fa";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import NewsModal from "../components/NewsModal";

// Dados de exemplo das notícias
const newsData = [
  {
    id: 1,
    title: "AppiSensor Revoluciona Entrega de Correio em Portugal",
    excerpt: "O novo dispositivo inteligente da Appicarta promete transformar a forma como recebemos correspondência, com notificações em tempo real e integração total com a app.",
    content: "O AppiSensor é o nosso mais recente lançamento - um dispositivo compacto que se instala na tua caixa de correio em segundos. Assim que o carteiro deposita alguma coisa, recebes uma notificação imediata no telemóvel.\n\nCom bateria que dura até 6 meses e ligação via WiFi, é a solução perfeita para nunca mais perderes uma entrega. O sensor deteta movimento e peso, distinguindo entre correio importante e publicidade.\n\nJá disponível na nossa loja online com envio gratuito para todo o país.",
    date: "15 Abr 2026",
    category: "Produto",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    featured: true,
  },
  {
    id: 2,
    title: "Parceria Estratégica com os CTT",
    excerpt: "A Appicarta anuncia uma parceria inovadora com os CTT para oferecer rastreamento integrado e entregas mais eficientes.",
    content: "É com grande orgulho que anunciamos a nossa parceria oficial com os CTT - Correios de Portugal. A partir de agora, todos os utilizadores Appicarta podem rastrear as suas encomendas nacionais diretamente na nossa aplicação.\n\nEsta integração permite receber notificações automáticas quando uma encomenda dos CTT está a caminho, simplificando a gestão do teu correio numa única plataforma.\n\nEm breve, estarão disponíveis funcionalidades adicionais como redirecionamento de entregas e agendamento de horários.",
    date: "10 Abr 2026",
    category: "Parcerias",
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80",
    featured: false,
  },
  {
    id: 3,
    title: "Nova Funcionalidade: Arco Familiar Expandido",
    excerpt: "Agora podes convidar até 10 membros para o teu Arco Familiar, facilitando a gestão da correspondência de toda a família.",
    content: "Ouviram os vossos pedidos! Aumentámos o limite do Arco Familiar de 5 para 10 membros. Agora toda a família extensa pode participar na gestão do correio.\n\nCada membro pode ver o que chegou, marcar itens como importantes e comunicar através do chat integrado. Perfeito para famílias grandes ou quem partilha casa com amigos.\n\nPara ativar, basta ir às Definições > Arco Familiar e enviar convites para os novos membros. Simples e rápido.",
    date: "5 Abr 2026",
    category: "App",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80",
    featured: false,
  },
  {
    id: 4,
    title: "Appicarta Conquista Prémio de Inovação",
    excerpt: "Reconhecimento internacional pela inovação em soluções de gestão de correspondência e comunicação familiar.",
    content: "A Appicarta foi distinguida com o Prémio Europeu de Inovação Digital 2026 na categoria de Soluções para o Lar. O júri destacou a nossa abordagem única à gestão familiar do correio.\n\nEstamos entre as 10 startups mais promissoras do setor, ao lado de empresas de Londres, Berlim e Barcelona. Este reconhecimento é um testemunho do trabalho árduo da nossa equipa e da confiança dos nossos utilizadores.\n\nO prémio será entregue na gala de Junho em Lisboa, onde apresentaremos as próximas novidades.",
    date: "28 Mar 2026",
    category: "Empresa",
    image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&q=80",
    featured: false,
  },
  {
    id: 5,
    title: "Expansão Internacional: Espanha e França",
    excerpt: "A Appicarta inicia operações em Madrid e Paris, marcando o início da expansão europeia.",
    content: "A Appicarta deixa de ser só portuguesa - chegámos a Espanha e França! As nossas equipas locais em Madrid e Paris já estão a trabalhar para adaptar a app às necessidades de cada país.\n\nNo horizonte está também a Alemanha e Itália para 2027. Queremos levar a revolução Appicarta a toda a Europa, mantendo sempre a qualidade e o foco na família que nos caracteriza.\n\nPara celebrar, todos os utilizadores têm acesso gratuito às funcionalidades premium durante uma semana.",
    date: "20 Mar 2026",
    category: "Empresa",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    featured: false,
  },
  {
    id: 6,
    title: "Atualização de Segurança: Autenticação Biométrica",
    excerpt: "Nova camada de proteção com reconhecimento facial e leitor de impressões digitais para maior segurança.",
    content: "A segurança dos vossos dados é a nossa prioridade. Com a última atualização, adicionámos autenticação biométrica à app Appicarta.\n\nAgora podes usar a tua cara ou impressão digital para desbloquear a aplicação - mais cómodo e mais seguro. Os dados biométricos são processados apenas no teu dispositivo, nunca nos nossos servidores.\n\nPara ativar, vai a Definições > Segurança > Biometria. Recomendamos a todos os utilizadores que ativem esta funcionalidade para protegerem o acesso ao Arco Familiar.",
    date: "15 Mar 2026",
    category: "Segurança",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    featured: false,
  },
];

const categories = ["Todas", "Produto", "App", "Parcerias", "Empresa", "Segurança"];

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function News() {
  const { darkMode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const headerY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const filteredNews = newsData.filter((news) => {
    const matchesCategory = selectedCategory === "Todas" || news.category === selectedCategory;
    const matchesSearch =
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredNews = filteredNews.find((n) => n.featured) || filteredNews[0];
  const regularNews = filteredNews.filter((n) => n.id !== featuredNews?.id);

  const openNews = (news) => {
    setSelectedNews(news);
    setIsModalOpen(true);
  };

  const closeNews = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedNews(null), 300);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`font-sans min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <motion.div
          className="absolute inset-0"
          style={{ y: headerY, opacity: headerOpacity }}
        >
          <div
            className={`absolute inset-0 ${
              darkMode
                ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                : "bg-gradient-to-br from-blue-50 via-white to-red-50"
            }`}
          />

          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-96 h-96 bg-red-300/20 dark:bg-red-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
          />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border ${
                darkMode
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-blue-500/10 text-blue-600 border-blue-500/20"
              }`}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                ✦
              </motion.span>
              Mantém-te Informado
            </motion.span>

            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-black mb-6 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Notícias da{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-red-500 dark:from-blue-400 dark:via-purple-400 dark:to-red-400">
                Appicarta
              </span>
            </h1>

            <p
              className={`text-lg max-w-2xl mx-auto ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Descobre as últimas novidades, atualizações e histórias sobre a nossa missão. Clica numa notícia para abrir a carta!
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div
              className={`relative flex items-center ${
                darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white/80 border-gray-200"
              } backdrop-blur-sm rounded-2xl border shadow-lg overflow-hidden`}
            >
              <FaSearch
                className={`absolute left-4 w-5 h-5 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder="Procurar notícias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-4 pl-12 pr-4 bg-transparent outline-none ${
                  darkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category, index) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? darkMode
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                      : "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : darkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Featured News - Envelope Card */}
          {featuredNews && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-16"
            >
              <motion.div
                onClick={() => openNews(featuredNews)}
                className={`relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
                whileHover={{ y: -5, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Envelope styling */}
                <div className="absolute top-4 right-4 z-20">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                      darkMode ? "bg-red-500" : "bg-blue-600"
                    }`}
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FaEnvelope className="w-5 h-5 text-white" />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-auto overflow-hidden">
                    <motion.img
                      src={featuredNews.image}
                      alt={featuredNews.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r" />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-4 py-1 rounded-full text-sm font-semibold ${
                          darkMode ? "bg-red-500 text-white" : "bg-blue-600 text-white"
                        }`}
                      >
                        Destaque
                      </span>
                    </div>

                    {/* Hover indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        className={`px-6 py-3 rounded-full font-semibold backdrop-blur-sm ${
                          darkMode ? "bg-red-500/90 text-white" : "bg-blue-600/90 text-white"
                        }`}
                      >
                        Abrir Carta
                      </motion.div>
                    </div>
                  </div>

                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                      <span
                        className={`flex items-center gap-2 text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <FaCalendarAlt />
                        {featuredNews.date}
                      </span>
                      <span
                        className={`flex items-center gap-2 text-sm ${
                          darkMode ? "text-red-400" : "text-blue-600"
                        }`}
                      >
                        <FaTag />
                        {featuredNews.category}
                      </span>
                    </div>

                    <h2
                      className={`text-2xl lg:text-3xl font-bold mb-4 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {featuredNews.title}
                    </h2>

                    <p
                      className={`text-lg mb-6 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {featuredNews.excerpt}
                    </p>

                    <motion.button className="flex items-center gap-2 font-semibold text-red-400">
                      <span>Abrir Carta</span>
                      <FaArrowRight />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* News Grid - Envelope Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularNews.map((news, index) => (
              <motion.article
                key={news.id}
                onClick={() => openNews(news)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className={`group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer ${
                  darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"
                }`}
              >
                {/* Envelope Icon */}
                <motion.div
                  className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                    darkMode ? "bg-red-500/90" : "bg-blue-600/90"
                  }`}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <FaEnvelope className="w-4 h-4 text-white" />
                </motion.div>

                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span
                      className={`px-4 py-2 rounded-full font-semibold text-sm ${
                        darkMode ? "bg-red-500 text-white" : "bg-blue-600 text-white"
                      }`}
                    >
                      Abrir Carta
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        darkMode ? "bg-gray-900/80 text-red-400" : "bg-white/90 text-blue-600"
                      }`}
                    >
                      {news.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className={`flex items-center gap-2 text-sm mb-3 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <FaCalendarAlt className="w-4 h-4" />
                    {news.date}
                  </div>

                  <h3
                    className={`text-xl font-bold mb-3 line-clamp-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {news.title}
                  </h3>

                  <p
                    className={`mb-4 line-clamp-2 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {news.excerpt}
                  </p>

                  <motion.div
                    className={`flex items-center gap-2 text-sm font-semibold ${
                      darkMode ? "text-red-400" : "text-blue-600"
                    }`}
                  >
                    <span>Ler mais</span>
                    <FaChevronRight className="w-3 h-3" />
                  </motion.div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className={`mt-20 rounded-3xl p-8 lg:p-12 ${
              darkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
                : "bg-gradient-to-br from-blue-600 to-blue-700"
            }`}
          >
            <div className="max-w-3xl mx-auto text-center">
              <h3 className={`text-2xl lg:text-3xl font-bold mb-4 text-white`}>
                Subscreve a Nossa Newsletter
              </h3>
              <p className={`mb-8 ${darkMode ? "text-gray-300" : "text-blue-100"}`}>
                Recebe as últimas notícias e atualizações diretamente no teu email.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="O teu email"
                  className={`flex-1 px-6 py-4 rounded-xl outline-none transition-all ${
                    darkMode
                      ? "bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-red-500"
                      : "bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:bg-white/30"
                  }`}
                />
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                    darkMode ? "bg-red-500 text-white hover:bg-red-600" : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Subscrever
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* News Modal - The Letter */}
      <NewsModal news={selectedNews} isOpen={isModalOpen} onClose={closeNews} />
    </motion.div>
  );
}
