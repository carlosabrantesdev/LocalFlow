"use client";

import React, { useState, useRef, useEffect } from 'react';
import { establishments } from '@/constants/establishments';

export default function Page() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [activeId, setActiveId] = useState(establishments[1].id);
  const establishment = establishments.find(e => e.id === activeId) || establishments[0];
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: establishment.initialMessage }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    setMessages([{ role: 'ai', content: establishment.initialMessage }]);
    setInput('');
  }, [activeId, establishment]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
          estabelecimento_id: establishment.id
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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    setDragOffset(currentX - dragStartX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    // MUDANÇA AQUI: Limite reduzido de 350 para 75. Fica super fácil e responsivo no celular.
    const SWIPE_THRESHOLD = 75;
    const currentIndex = establishments.findIndex(e => e.id === activeId);

    if (dragOffset > SWIPE_THRESHOLD) {
      const prevIndex = currentIndex === 0 ? establishments.length - 1 : currentIndex - 1;
      setActiveId(establishments[prevIndex].id);
    } else if (dragOffset < -SWIPE_THRESHOLD) {
      const nextIndex = currentIndex === establishments.length - 1 ? 0 : currentIndex + 1;
      setActiveId(establishments[nextIndex].id);
    }

    setDragOffset(0);
  };

  const colors = isDarkMode ? establishment.theme.dark : establishment.theme.light;

  return (
    <div
      // MUDANÇA AQUI: Trocado min-h-screen por h-[100dvh]
      className="relative h-[100dvh] w-full overflow-hidden antialiased transition-colors duration-500"
      style={{ backgroundColor: colors.surface, color: colors['on-surface'], fontFamily: '"Manrope", sans-serif' }}
    >
      <div className="absolute inset-0 z-0">
        {establishment.bgImage && (
          <img
            alt={`${establishment.name} background`}
            className={`w-full h-full object-cover transition-all duration-500 ${isDarkMode ? 'opacity-40 brightness-50' : 'opacity-80'}`}
            src={establishment.bgImage}
          />
        )}
        <div className="absolute inset-0 transition-colors duration-500 backdrop-blur-md" style={{ backgroundColor: `${colors.surface}20` }}></div>
      </div>

      {/* MUDANÇA AQUI: Ajuste no wrapper para ocupar a altura inteira exata */}
      <div className="relative z-10 flex items-center justify-center h-full w-full p-0 sm:p-4 md:p-8 overflow-hidden">
        <div
          // MUDANÇA AQUI: No celular ele pega a altura inteira (h-full), e o min-h-[600px] aplica APENAS no desktop (sm:min-h-[600px])
          className={`w-full max-w-3xl h-full sm:h-[80vh] sm:min-h-[600px] backdrop-blur-md sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-b-0 sm:border transition-colors duration-500 touch-pan-y ${!isDragging ? 'transition-transform duration-500 ease-out' : ''}`}
          style={{
            backgroundColor: `${colors['surface-container-lowest']}F2`,
            borderColor: `${colors['surface-variant']}80`,
            transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.02}deg)`,
          }}
        >
          {/* Chat Header */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="backdrop-blur-md rounded-t-2xl sm:rounded-t-2xl rounded-none w-full border-b shadow-sm flex items-center justify-between px-4 sm:px-6 py-4 shrink-0 transition-colors duration-500 select-none"
            style={{
              backgroundColor: `${colors.surface}CC`,
              borderColor: colors['surface-variant'],
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            <div className="flex items-center gap-3 sm:gap-4 pointer-events-none">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0 shadow-sm overflow-hidden transition-colors duration-500 flex items-center justify-center font-semibold text-base sm:text-lg"
                style={{ backgroundColor: colors['primary-container'], color: colors['on-primary-container'] }}
              >
                {establishment.logo ? (
                  <img src={establishment.logo} alt={establishment.name} className="w-full h-full object-cover" />
                ) : (
                  establishment.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-semibold m-0 leading-tight transition-colors duration-500" style={{ color: colors['on-surface'] }}>
                  {establishment.name}
                </h2>
                <span className="text-[10px] sm:text-xs m-0 leading-none mt-1 transition-colors duration-500" style={{ color: colors.primary }}>
                  {establishment.subtitle}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200 flex items-center justify-center"
              style={{ color: colors['on-surface-variant'] }}
              title="Alternar Tema"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          {/* Área de Mensagens */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-transparent flex flex-col cursor-auto custom-scrollbar">
            <div className="flex justify-center">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full transition-colors duration-500"
                style={{ color: `${colors['on-surface-variant']}99`, backgroundColor: `${colors['surface-container']}80` }}
              >
                Hoje
              </span>
            </div>

            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col gap-1 mt-2 ${msg.role === 'user' ? 'items-end self-end max-w-[85%] sm:max-w-[80%]' : 'items-start self-start max-w-[85%] sm:max-w-[80%]'}`}>
                <span className="text-xs mx-2 transition-colors duration-500" style={{ color: colors['on-surface-variant'] }}>
                  {msg.role === 'user' ? 'Você' : `Assistente ${establishment.name}`}
                </span>
                <div
                  className={`p-3 sm:p-4 rounded-2xl shadow-sm text-sm sm:text-base border transition-colors duration-500 ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
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
                <span className="text-xs ml-2 transition-colors duration-500" style={{ color: colors['on-surface-variant'] }}>Assistente {establishment.name}</span>
                <div
                  className="p-4 rounded-2xl rounded-tl-sm shadow-sm text-base border flex gap-1.5 items-center h-12 transition-colors duration-500"
                  style={{ backgroundColor: colors['surface-container'], color: colors['on-surface'], borderColor: `${colors['surface-variant']}80` }}
                >
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${colors['on-surface-variant']}99`, animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${colors['on-surface-variant']}99`, animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${colors['on-surface-variant']}99`, animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 pt-1 shrink-0 self-start ml-2 scrollbar-hide">
              {establishment.recommendations.map((text) => (
                <button
                  key={text}
                  onClick={() => sendMessage(text)}
                  className="shrink-0 border px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-500 whitespace-nowrap shadow-sm"
                  style={{ borderColor: `${colors.primary}4D`, backgroundColor: `${colors.primary}0D`, color: colors.primary }}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {/* Área de Input (Agora sempre visível) */}
          <div
            className="border-t p-3 sm:p-4 md:p-6 shrink-0 transition-colors duration-500 cursor-auto"
            style={{ backgroundColor: `${colors.surface}E6`, borderColor: colors['surface-variant'] }}
          >
            <div
              className="flex items-center gap-2 sm:gap-3 rounded-full px-3 py-2 sm:px-4 sm:py-3 border focus-within:ring-2 shadow-sm transition-colors duration-500"
              style={{ backgroundColor: colors['surface-container-low'], borderColor: colors['surface-variant'] }}
            >
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm sm:text-base p-1 outline-none transition-colors duration-500"
                placeholder={`Pergunte sobre ${establishment.name}...`}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                style={{ color: colors['on-surface'] }}
              />
              <button
                onClick={() => sendMessage(input)}
                className="rounded-full p-2 transition-transform duration-200 active:scale-90 flex shrink-0"
                style={{ backgroundColor: `${colors['primary-container']}4D`, color: colors.primary }}
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">send</span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-2 sm:mt-3 select-none opacity-40 hover:opacity-70 transition-opacity duration-300">
              <span
                className="material-symbols-outlined text-[12px] sm:text-[14px]"
                style={{ color: colors['on-surface'] }}
              >
                memory
              </span>
              <span
                className="text-[9px] sm:text-[11px] font-medium transition-colors duration-500"
                style={{ color: colors['on-surface'] }}
              >
                <strong className="font-bold">LocalFlow:</strong> Aplicação que usa <strong className="font-bold">IA Local</strong> (llama3.2).
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}