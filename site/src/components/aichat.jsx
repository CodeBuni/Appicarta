// src/components/AIChat.js
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaPaperPlane, FaTimes, FaMinus, FaSearch, FaQuestionCircle, FaHome, FaUsers, FaBell, FaShoppingCart, FaMobile, FaShieldAlt, FaHistory, FaEnvelope, FaExpand, FaCompress } from 'react-icons/fa';
import mascoteButao from '../assets/mascote-butao.png';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedQuestion]);

  // Base de dados de perguntas e respostas
  const faqData = [
    {
      id: 1,
      pergunta: "Como funciona a AppiCarta?",
      resposta: "A AppiCarta utiliza um sensor inteligente colocado na caixa do correio que deteta quando chega uma carta. Assim que é detetada, recebes uma notificação imediata na aplicação. Além disso, a app permite comunicar com membros do teu Arco Familiar para que outra pessoa possa recolher a correspondência caso não estejas em casa.",
      categoria: "funcionamento",
      icon: FaHome,
      emoji: "📮"
    },
    {
      id: 2,
      pergunta: "O que é o Arco Familiar?",
      resposta: "O Arco Familiar é um grupo privado composto por pessoas que partilham a mesma caixa de correio ou vivem na mesma residência. Dentro do arco podes enviar mensagens, pedir ajuda para recolher cartas e ver quem está disponível.",
      categoria: "arco",
      icon: FaUsers,
      emoji: "👨‍👩‍👧‍👦"
    },
    {
      id: 3,
      pergunta: "Como posso adicionar pessoas ao meu Arco Familiar?",
      resposta: "Podes adicionar novas pessoas directamente nas definições do teu Arco Familiar. Basta introduzir o email da pessoa, e ela receberá um convite para aceitar. Quando aceitar, passa automaticamente a fazer parte do teu grupo.",
      categoria: "arco",
      icon: FaUsers,
      emoji: "➕"
    },
    {
      id: 4,
      pergunta: "Posso usar a AppiCarta sem sensor?",
      resposta: "Sim, podes usar a parte social da aplicação — envio de mensagens, pedidos de recolha e gestão do Arco Familiar. No entanto, sem o sensor não receberás notificações automáticas de chegada de correio.",
      categoria: "funcionamento",
      icon: FaBell,
      emoji: "📱"
    },
    {
      id: 5,
      pergunta: "Como recebo notificações de carta?",
      resposta: "Assim que o sensor detetar movimento ou abertura da caixa do correio, este comunica automaticamente com o servidor da AppiCarta. A app envia-te uma notificação push para que saibas imediatamente que tens correio.",
      categoria: "notificacoes",
      icon: FaBell,
      emoji: "🔔"
    },
    {
      id: 6,
      pergunta: "A app é gratuita?",
      resposta: "A aplicação pode ser descarregada gratuitamente. No entanto, alguns serviços como funcionalidades premium, histórico detalhado ou automações avançadas podem exigir uma subscrição mensal. O sensor físico também é adquirido separadamente.",
      categoria: "precos",
      icon: FaShoppingCart,
      emoji: "💰"
    },
    {
      id: 7,
      pergunta: "Onde posso comprar o sensor?",
      resposta: "O sensor pode ser comprado directamente no site oficial da AppiCarta, na secção 'Loja'. Lá encontras informações sobre preços, instruções de instalação e opções de envio para Portugal e restantes países da UE.",
      categoria: "sensor",
      icon: FaShoppingCart,
      emoji: "🛒"
    },
    {
      id: 8,
      pergunta: "É difícil instalar o sensor?",
      resposta: "A instalação é bastante simples. O sensor vem com fita adesiva resistente que permite colá-lo na tampa interna da tua caixa do correio. Depois basta emparelhá-lo com a app através de Bluetooth na primeira configuração — o processo leva menos de 2 minutos.",
      categoria: "sensor",
      icon: FaMobile,
      emoji: "🔧"
    },
    {
      id: 9,
      pergunta: "A AppiCarta funciona em Android e iPhone?",
      resposta: "Sim, está disponível para Android (Google Play) e iOS (App Store). Ambas as versões recebem atualizações frequentes, têm o mesmo design e funcionalidades idênticas.",
      categoria: "app",
      icon: FaMobile,
      emoji: "📱"
    },
    {
      id: 10,
      pergunta: "O que acontece se eu não estiver em casa e chegar carta?",
      resposta: "Recebes uma notificação imediata e, caso não possas ir, podes usar a app para pedir a alguém do teu Arco Familiar que recolha a carta por ti. Podes até enviar uma mensagem ao grupo com instruções.",
      categoria: "funcionamento",
      icon: FaHome,
      emoji: "🏠"
    },
    {
      id: 11,
      pergunta: "Posso ver quem recolheu a carta?",
      resposta: "Sim. A app permite que a pessoa que recolheu marque no sistema que a carta já foi retirada da caixa. Todos os membros do Arco Familiar recebem essa atualização.",
      categoria: "arco",
      icon: FaUsers,
      emoji: "👀"
    },
    {
      id: 12,
      pergunta: "Como envio mensagens?",
      resposta: "No separador 'Mensagens', escolhes um membro ou envias diretamente para o grupo. Podes enviar texto, fotos e até notas de voz. É simples e funciona como um chat normal.",
      categoria: "app",
      icon: FaEnvelope,
      emoji: "💬"
    },
    {
      id: 13,
      pergunta: "O assistente guarda os meus dados?",
      resposta: "A AppiCarta segue políticas de segurança rigorosas. Todos os dados são encriptados e apenas usados para funcionamento da aplicação. Não são partilhados com terceiros. As conversas no Arco Familiar são privadas.",
      categoria: "seguranca",
      icon: FaShieldAlt,
      emoji: "🔒"
    },
    {
      id: 14,
      pergunta: "Posso ligar o sensor a várias contas?",
      resposta: "Sim. O sensor pode estar associado ao Arco Familiar, o que significa que qualquer membro autorizado terá acesso às notificações e ao histórico, sem necessidade de emparelhar novamente.",
      categoria: "sensor",
      icon: FaUsers,
      emoji: "🔗"
    },
    {
      id: 15,
      pergunta: "Perdi a ligação com o sensor, o que faço?",
      resposta: "Vai às definições do sensor dentro da app e clica em 'Reparar'. O sistema fará uma nova procura do dispositivo e restabelece a ligação. Se persistir, reinicia o sensor removendo e recolocando a bateria.",
      categoria: "sensor",
      icon: FaMobile,
      emoji: "🔧"
    },
    {
      id: 16,
      pergunta: "Como altero o nome do meu Arco Familiar?",
      resposta: "Basta ir ao menu 'Arco Familiar', seleccionar 'Editar Informações' e mudar o nome. A alteração é imediata e todos os membros vêem o novo nome.",
      categoria: "arco",
      icon: FaUsers,
      emoji: "✏️"
    },
    {
      id: 17,
      pergunta: "Posso desativar notificações?",
      resposta: "Claro. Nas definições de notificações podes escolher se queres receber alertas de nova carta, mensagens do grupo ou apenas os essenciais. Podes activar e desactivar quando quiseres.",
      categoria: "notificacoes",
      icon: FaBell,
      emoji: "🔕"
    },
    {
      id: 18,
      pergunta: "Há histórico de cartas recebidas?",
      resposta: "Sim. No separador 'Histórico', podes ver todos os dias em que recebeste correio, quem o recolheu e qualquer nota associada. Esta função pode ser limitada na versão gratuita.",
      categoria: "app",
      icon: FaHistory,
      emoji: "📊"
    },
    {
      id: 19,
      pergunta: "A AppiCarta funciona para apartamentos?",
      resposta: "Sim. É ideal para apartamentos, prédios ou residências partilhadas. Cada arco corresponde a uma caixa de correio, mesmo que várias pessoas tenham acesso a ela.",
      categoria: "funcionamento",
      icon: FaHome,
      emoji: "🏢"
    },
    {
      id: 20,
      pergunta: "Como posso contactar o suporte?",
      resposta: "No site e na própria app tens a secção 'Ajuda e Suporte', onde podes enviar uma mensagem direta, ver perguntas frequentes ou reportar um problema técnico. O suporte normalmente responde em menos de 24 horas.",
      categoria: "suporte",
      icon: FaQuestionCircle,
      emoji: "📞"
    }
  ];

  // Categorias
  const categories = [
    { id: 'todos', name: 'Todas as Perguntas', icon: FaQuestionCircle, color: 'from-purple-500 to-pink-500' },
    { id: 'funcionamento', name: 'Funcionamento', icon: FaHome, color: 'from-blue-500 to-cyan-500' },
    { id: 'arco', name: 'Arco Familiar', icon: FaUsers, color: 'from-green-500 to-emerald-500' },
    { id: 'sensor', name: 'Sensor', icon: FaMobile, color: 'from-orange-500 to-red-500' },
    { id: 'app', name: 'Aplicação', icon: FaMobile, color: 'from-indigo-500 to-purple-500' },
    { id: 'notificacoes', name: 'Notificações', icon: FaBell, color: 'from-yellow-500 to-orange-500' },
    { id: 'precos', name: 'Preços', icon: FaShoppingCart, color: 'from-teal-500 to-blue-500' },
    { id: 'seguranca', name: 'Segurança', icon: FaShieldAlt, color: 'from-gray-500 to-blue-500' },
    { id: 'suporte', name: 'Suporte', icon: FaQuestionCircle, color: 'from-red-500 to-pink-500' }
  ];

  // Filtrar perguntas
  const filteredQuestions = faqData.filter(item => {
    const matchesCategory = activeCategory === 'todos' || item.categoria === activeCategory;
    const matchesSearch = item.pergunta.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.resposta.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSelectedQuestion(null);
      setSearchTerm('');
      setActiveCategory('todos');
      setIsExpanded(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
  };

  const handleBackToQuestions = () => {
    setSelectedQuestion(null);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <motion.button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-blue-600 to-red-500 rounded-full shadow-2xl flex items-center justify-center group hover:shadow-3xl transition-all duration-300 overflow-hidden p-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <img 
            src={mascoteButao} 
            alt="Mascote AppiCarta" 
            className="w-full h-full object-contain"
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col ${
              isExpanded 
                ? 'inset-4 w-auto h-auto' 
                : 'bottom-6 right-6 w-96 h-[600px]'
            }`}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-red-500 px-4 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden p-1.5">
                    <img 
                      src={mascoteButao} 
                      alt="Mascote AppiCarta" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">AppiAlberto</h3>
                    <p className="text-white/80 text-sm">Centro de Ajuda Inteligente</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={toggleExpand}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    title={isExpanded ? "Reduzir" : "Expandir"}
                  >
                    {isExpanded ? (
                      <FaCompress className="w-3 h-3 text-white" />
                    ) : (
                      <FaExpand className="w-3 h-3 text-white" />
                    )}
                  </button>
                  <button
                    onClick={toggleChat}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <FaMinus className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={toggleChat}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <FaTimes className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Pesquisar perguntas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-full pl-10 pr-4 py-2 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>

            {/* Categories */}
            {!selectedQuestion && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                          activeCategory === category.id
                            ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                            : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                        }`}
                      >
                        <IconComponent className="w-3 h-3" />
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <AnimatePresence mode="wait">
                {selectedQuestion ? (
                  // View de resposta individual
                  <motion.div
                    key="answer"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="p-4"
                  >
                    <button
                      onClick={handleBackToQuestions}
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 text-sm font-medium transition-colors"
                    >
                      ← Voltar às perguntas
                    </button>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg">
                          {selectedQuestion.emoji}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                          {selectedQuestion.pergunta}
                        </h3>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {selectedQuestion.resposta}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Esta resposta foi útil? 
                          <button className="ml-2 text-blue-600 dark:text-blue-400 hover:underline">
                            Sim
                          </button>
                          <button className="ml-2 text-blue-600 dark:text-blue-400 hover:underline">
                            Não
                          </button>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // View de lista de perguntas
                  <motion.div
                    key="questions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4"
                  >
                    <div className="mb-4">
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                        {activeCategory === 'todos' 
                          ? 'Perguntas Frequentes' 
                          : `Perguntas sobre ${categories.find(c => c.id === activeCategory)?.name}`
                        }
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {filteredQuestions.length} pergunta(s) encontrada(s)
                      </p>
                    </div>

                    <div className="space-y-3">
                      {filteredQuestions.map((question, index) => {
                        const IconComponent = question.icon;
                        return (
                          <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleQuestionClick(question)}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm group-hover:scale-110 transition-transform">
                                {question.emoji}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm leading-tight">
                                  {question.pergunta}
                                </h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {question.resposta.substring(0, 60)}...
                                </p>
                              </div>
                              <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                                <IconComponent className="w-4 h-4" />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}

                      {filteredQuestions.length === 0 && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaSearch className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Nenhuma pergunta encontrada
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Tenta pesquisar com outras palavras
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Não encontras o que procuras?{' '}
                  <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Contacta o suporte
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}