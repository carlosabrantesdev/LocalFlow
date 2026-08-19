"use client";

import React, { useState, useRef, useEffect } from 'react';

export default function Page() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    cpu: '0.0',
    ram: '0.0',
    vram: '0.0'
  });
  
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Olá! Pronto para transformar seu corpo e mente? Como posso ajudar você a alcançar seus objetivos de treino hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showSystemInfo) {
      fetchSystemInfo();
      interval = setInterval(fetchSystemInfo, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showSystemInfo]);

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/system-info`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const data = await response.json();
      setSystemInfo({
        cpu: data.cpu_ia_percentual.toString(),
        ram: data.ram_ia_mb.toString(),
        vram: data.vram_ia_mb.toString()
      });
    } catch (error) {
      console.error('Erro ao buscar info do sistema:', error);
    }
  };

  const toggleSystemInfo = async () => {
    if (!showSystemInfo) {
      await fetchSystemInfo();
    }
    setShowSystemInfo(!showSystemInfo);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: text,
          estabelecimento_id: 'academia_acao'
        }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.resposta_ia }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Desculpe, tive um problema técnico. Pode tentar novamente?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const colors = isDarkMode ? {
    surface: '#0F172A',
    'on-surface': '#F8FAFC',
    'surface-container-lowest': '#020617',
    'surface-variant': '#334155',
    'surface-container': '#1E293B',
    'on-surface-variant': '#94A3B8',
    'primary-container': '#7C2D12',
    'on-primary-container': '#FFEDD5',
    primary: '#F97316',
    'on-primary': '#FFFFFF',
    'surface-container-low': '#0F172A'
  } : {
    surface: '#F8FAFC',
    'on-surface': '#0F172A',
    'surface-container-lowest': '#FFFFFF',
    'surface-variant': '#E2E8F0',
    'surface-container': '#F1F5F9',
    'on-surface-variant': '#475569',
    'primary-container': '#FFEDD5',
    'on-primary-container': '#EA580C',
    primary: '#EA580C',
    'on-primary': '#FFFFFF',
    'surface-container-low': '#F8FAFC'
  };

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden antialiased transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: colors.surface, color: colors['on-surface'], fontFamily: '"Manrope", sans-serif' }}
    >
      {/* Background Sólido Otimizado */}
      <div className="absolute inset-0 z-0 transition-colors duration-700 ease-in-out" 
           style={{ backgroundColor: colors.surface }}>
      </div>

      <div className="relative z-10 flex items-center justify-center h-full w-full p-0 sm:p-4 md:p-8 overflow-hidden">
        {/* Container Principal */}
        <div
          className="w-full max-w-3xl h-full sm:h-[80vh] sm:min-h-[600px] backdrop-blur-md sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-b-0 sm:border transition-colors duration-700 ease-in-out"
          style={{
            backgroundColor: `${colors['surface-container-lowest']}E6`, // Aumentado ligeiramente a opacidade para compensar a perda do blur de fundo
            borderColor: `${colors['surface-variant']}80`,
          }}
        >
          {/* Chat Header */}
          <div
            className="rounded-t-2xl sm:rounded-t-2xl rounded-none w-full border-b shadow-sm flex items-center justify-between px-4 sm:px-6 py-4 shrink-0 transition-colors duration-700 ease-in-out select-none"
            style={{
              backgroundColor: `${colors.surface}CC`,
              borderColor: colors['surface-variant'],
            }}
          >
            <div className="flex items-center gap-3 sm:gap-4 pointer-events-none">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0 shadow-sm overflow-hidden transition-colors duration-700 ease-in-out flex items-center justify-center font-semibold text-base sm:text-lg"
                style={{ backgroundColor: colors['primary-container'], color: colors['on-primary-container'] }}
              >
                <img 
                  src="https://i.ibb.co/LdSxDbZK/67e2c9fd-f670-48ad-866b-8944ba4ed01c.png" 
                  alt="Academia Ação" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-semibold m-0 leading-tight transition-colors duration-700 ease-in-out" style={{ color: colors['on-surface'] }}>
                  Academia Ação
                </h2>
                <span className="text-[10px] sm:text-xs m-0 leading-none mt-1 transition-colors duration-700 ease-in-out" style={{ color: colors.primary }}>
                  Sua dose diária de energia
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={toggleSystemInfo}
                className="p-2 w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-300 flex items-center justify-center relative"
                style={{ color: colors['on-surface-variant'] }}
                title="Informações do Sistema"
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">computer</span>
                
                {showSystemInfo && (
                  <div 
                    className="absolute top-full right-0 mt-2 p-3 rounded-xl shadow-xl border z-50 min-w-[160px] animate-in fade-in zoom-in duration-200"
                    style={{ 
                      backgroundColor: colors['surface-container-lowest'], 
                      borderColor: colors['surface-variant'],
                      color: colors['on-surface']
                    }}
                  >
                    <div className="flex flex-col gap-1 text-xs sm:text-sm">
                      <div className="text-center font-bold mb-2 pb-1 border-b" style={{ borderColor: colors['surface-variant'] }}>
                        Consumo da IA
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="opacity-70">CPU:</span>
                        <span className="font-mono font-medium">{systemInfo.cpu}%</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="opacity-70">RAM:</span>
                        <span className="font-mono font-medium">{systemInfo.ram} MB</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="opacity-70">VRAM:</span>
                        <span className="font-mono font-medium">{systemInfo.vram} MB</span>
                      </div>
                    </div>
                  </div>
                )}
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-300 flex items-center justify-center relative overflow-hidden"
                style={{ color: colors['on-surface-variant'] }}
                title="Alternar Tema"
              >
                <span
                  className={`material-symbols-outlined absolute text-[24px] transform-gpu transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isDarkMode 
                      ? 'translate-y-8 opacity-0 rotate-[60deg] scale-50' 
                      : 'translate-y-0 opacity-100 rotate-0 scale-100'
                  }`}
                >
                  dark_mode
                </span>
                <span
                  className={`material-symbols-outlined absolute text-[24px] transform-gpu transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isDarkMode 
                      ? 'translate-y-0 opacity-100 rotate-0 scale-100' 
                      : '-translate-y-8 opacity-0 -rotate-[60deg] scale-50'
                  }`}
                >
                  light_mode
                </span>
              </button>
            </div>
          </div>

          {/* Área de Mensagens */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-transparent flex flex-col cursor-auto custom-scrollbar transition-colors duration-700 ease-in-out">
            <div className="flex justify-center">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full transition-colors duration-700 ease-in-out"
                style={{ color: `${colors['on-surface-variant']}99`, backgroundColor: `${colors['surface-container']}80` }}
              >
                Hoje
              </span>
            </div>

            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col gap-1 mt-2 ${msg.role === 'user' ? 'items-end self-end max-w-[85%] sm:max-w-[80%]' : 'items-start self-start max-w-[85%] sm:max-w-[80%]'}`}>
                <span className="text-xs mx-2 transition-colors duration-700 ease-in-out" style={{ color: colors['on-surface-variant'] }}>
                  {msg.role === 'user' ? 'Você' : 'Assistente Academia Ação'}
                </span>
                <div
                  className={`p-3 sm:p-4 rounded-2xl shadow-sm text-sm sm:text-base border transition-colors duration-700 ease-in-out ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                  style={{
                    backgroundColor: msg.role === 'user' ? colors.primary : colors['surface-container'],
                    color: msg.role === 'user' ? colors['on-primary'] : colors['on-surface'],
                    borderColor: `${colors['surface-variant']}80`
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex flex-col items-start max-w-[80%] self-start gap-1 mt-2">
                <span className="text-xs ml-2 transition-colors duration-700 ease-in-out" style={{ color: colors['on-surface-variant'] }}>Assistente Academia Ação</span>
                <div
                  className="p-4 rounded-2xl rounded-tl-sm shadow-sm text-base border flex gap-1.5 items-center h-12 transition-colors duration-700 ease-in-out"
                  style={{ backgroundColor: colors['surface-container'], color: colors['on-surface'], borderColor: `${colors['surface-variant']}80` }}
                >
                  <span className="w-2 h-2 rounded-full animate-bounce transition-colors duration-700 ease-in-out" style={{ backgroundColor: `${colors['on-surface-variant']}99`, animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce transition-colors duration-700 ease-in-out" style={{ backgroundColor: `${colors['on-surface-variant']}99`, animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce transition-colors duration-700 ease-in-out" style={{ backgroundColor: `${colors['on-surface-variant']}99`, animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            {/* Recomendações embutidas */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 pt-1 shrink-0 self-start ml-2 scrollbar-hide">
              {['Planos de treino', 'Horários de funcionamento', 'Localização'].map((text) => (
                <button
                  key={text}
                  onClick={() => sendMessage(text)}
                  className="shrink-0 border px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-700 ease-in-out whitespace-nowrap shadow-sm hover:opacity-80"
                  style={{ borderColor: `${colors.primary}4D`, backgroundColor: `${colors.primary}0D`, color: colors.primary }}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {/* Área de Input */}
          <div
            className="border-t p-3 sm:p-4 md:p-6 shrink-0 transition-colors duration-700 ease-in-out cursor-auto"
            style={{ backgroundColor: `${colors.surface}E6`, borderColor: colors['surface-variant'] }}
          >
            <div
              className="flex items-center gap-2 sm:gap-3 rounded-full px-3 py-2 sm:px-4 sm:py-3 border focus-within:ring-2 shadow-sm transition-colors duration-700 ease-in-out"
              style={{ backgroundColor: colors['surface-container-low'], borderColor: colors['surface-variant'] }}
            >
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm sm:text-base p-1 outline-none transition-colors duration-700 ease-in-out placeholder:transition-colors placeholder:duration-700"
                placeholder="Pergunte sobre Academia Ação..."
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                style={{ color: colors['on-surface'] }}
              />
              <button
                onClick={() => sendMessage(input)}
                className="rounded-full p-2 transform-gpu transition-[transform,background-color,color] duration-300 active:scale-90 flex shrink-0 hover:opacity-80"
                style={{ backgroundColor: `${colors['primary-container']}4D`, color: colors.primary }}
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">send</span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-2 sm:mt-3 select-none opacity-40 hover:opacity-70 transition-opacity duration-300">
              <span
                className="material-symbols-outlined text-[12px] sm:text-[14px] transition-colors duration-700 ease-in-out"
                style={{ color: colors['on-surface'] }}
              >
                memory
              </span>
              <span
                className="text-[9px] sm:text-[11px] font-medium transition-colors duration-700 ease-in-out"
                style={{ color: colors['on-surface'] }}
              >
                <strong className="font-bold">LocalFlow:</strong> Aplicação que usa <strong className="font-bold">IA Local</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}