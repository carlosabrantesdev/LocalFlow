"use client";

import React, { useState, useRef, useEffect } from 'react';
import { establishments } from '@/constants/establishments';

export default function Page() {
  // 1. Estado para controlar qual estabelecimento está ativo
  const [activeId, setActiveId] = useState(establishments[1].id);
  
  // 2. Deriva o estabelecimento atual com base no ID
  const establishment = establishments.find(e => e.id === activeId) || establishments[0];

  const [messages, setMessages] = useState([
    { role: 'ai', content: establishment.initialMessage }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- ESTADOS PARA O DRAG (ARRASTO) ---
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // 3. Reseta o chat com a mensagem inicial correta sempre que trocar de loja
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
      const response = await fetch('http://localhost:8000/api/chat', {
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

  // --- LÓGICA DE GESTOS (SWIPE) AGORA NO HEADER ---
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    // Usa currentTarget para capturar o ponteiro estritamente no header
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

    const SWIPE_THRESHOLD = 350; 
    const currentIndex = establishments.findIndex(e => e.id === activeId);

    if (dragOffset > SWIPE_THRESHOLD) {
      // Arrastou para a DIREITA -> Estabelecimento Anterior
      const prevIndex = currentIndex === 0 ? establishments.length - 1 : currentIndex - 1;
      setActiveId(establishments[prevIndex].id);
    } else if (dragOffset < -SWIPE_THRESHOLD) {
      // Arrastou para a ESQUERDA -> Próximo Estabelecimento
      const nextIndex = currentIndex === establishments.length - 1 ? 0 : currentIndex + 1;
      setActiveId(establishments[nextIndex].id);
    }

    setDragOffset(0);
  };

  const colors = establishment.theme;

  return (
    <div 
      className="relative min-h-screen overflow-hidden antialiased transition-colors duration-500" 
      style={{ backgroundColor: colors.surface, color: colors['on-surface'], fontFamily: '"Inter", sans-serif' }}
    >
      {/* Full Screen Background Image */}
      <div className="absolute inset-0 z-0">
        {establishment.bgImage && (
          <img 
            alt={`${establishment.name} background`} 
            className="w-full h-full object-cover transition-opacity duration-500" 
            src={establishment.bgImage}
          />
        )}
        <div className="absolute inset-0 transition-colors duration-500 backdrop-blur-md" style={{ backgroundColor: `${colors.surface}20` }}></div>
      </div>

      {/* Centered Chat Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-0 sm:p-4 md:p-8 overflow-hidden">
        <div 
          // A DIV container agora só recebe os estilos de transformação, não os eventos
          className={`w-full max-w-3xl h-screen sm:h-[80vh] min-h-[600px] backdrop-blur-md sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-b-0 sm:border transition-colors duration-500 touch-pan-y ${!isDragging ? 'transition-transform duration-500 ease-out' : ''}`} 
          style={{ 
            backgroundColor: `${colors['surface-container-lowest']}F2`, 
            borderColor: `${colors['surface-variant']}80`,
            transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.02}deg)`,
          }}
        >
          {/* Chat Header - Eventos de Pointer aplicados APENAS aqui */}
          <div 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="backdrop-blur-md rounded-t-2xl w-full border-b shadow-sm flex items-center justify-between px-6 py-4 shrink-0 transition-colors duration-500 select-none" 
            style={{ 
              backgroundColor: `${colors.surface}CC`, 
              borderColor: colors['surface-variant'],
              cursor: isDragging ? 'grabbing' : 'grab' 
            }}
          >
            <div className="flex items-center gap-4 pointer-events-none">
              <div 
                className="w-12 h-12 rounded-full shrink-0 shadow-sm overflow-hidden transition-colors duration-500" 
                style={{ backgroundColor: colors['primary-container'] }}
              >
                {establishment.logo ? (
                  <img 
                    src={establishment.logo} 
                    alt={establishment.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-semibold text-lg" style={{ color: colors['on-primary-container'] }}>
                    {establishment.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <h2 
                  className="text-xl font-semibold m-0 leading-tight transition-colors duration-500"
                  style={{ color: colors['on-surface'] }}
                >
                  {establishment.name}
                </h2>
                <span className="text-xs m-0 leading-none mt-1 transition-colors duration-500" style={{ color: colors.primary }}>
                  {establishment.subtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent flex flex-col scrollbar-hide cursor-auto">
            {/* Date Separator */}
            <div className="flex justify-center">
              <span 
                className="text-xs font-semibold px-3 py-1 rounded-full transition-colors duration-500" 
                style={{ 
                  color: `${colors['on-surface-variant']}99`, 
                  backgroundColor: `${colors['surface-container']}80` 
                }}
              >
                Hoje
              </span>
            </div>

            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col gap-1 mt-2 ${msg.role === 'user' ? 'items-end self-end max-w-[80%]' : 'items-start self-start max-w-[80%]'}`}>
                <span className="text-xs mx-2 transition-colors duration-500" style={{ color: colors['on-surface-variant'] }}>
                  {msg.role === 'user' ? 'Você' : `Assistente ${establishment.name}`}
                </span>
                <div 
                  className={`p-4 rounded-2xl shadow-sm text-base border transition-colors duration-500 ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`} 
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
                  style={{ 
                    backgroundColor: colors['surface-container'], 
                    color: colors['on-surface'], 
                    borderColor: `${colors['surface-variant']}80` 
                  }}
                >
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${colors['on-surface-variant']}99`, animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${colors['on-surface-variant']}99`, animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${colors['on-surface-variant']}99`, animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 pt-1 shrink-0 self-start ml-2 scrollbar-hide">
              {establishment.recommendations.map((text) => (
                <button 
                  key={text}
                  onClick={() => sendMessage(text)}
                  className="shrink-0 border px-4 py-2 rounded-full text-sm font-medium transition-colors duration-500 whitespace-nowrap shadow-sm" 
                  style={{ 
                    borderColor: `${colors.primary}4D`, 
                    backgroundColor: `${colors.primary}0D`, 
                    color: colors.primary 
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div 
            className="border-t p-4 md:p-6 shrink-0 transition-colors duration-500 cursor-auto" 
            style={{ 
              backgroundColor: `${colors.surface}E6`, 
              borderColor: colors['surface-variant'] 
            }}
          >
            <div 
              className="flex items-center gap-3 rounded-full px-4 py-3 border focus-within:ring-2 shadow-sm transition-colors duration-500" 
              style={{ 
                backgroundColor: colors['surface-container-low'], 
                borderColor: colors['surface-variant'] 
              }}
            >
              <button 
                className="hover:text-primary transition-transform duration-200 active:scale-90 flex shrink-0" 
                style={{ color: colors['on-surface-variant'] }}
              >
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <input 
                className="flex-1 bg-transparent border-none focus:ring-0 text-base p-0 outline-none transition-colors duration-500" 
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
                style={{ 
                  backgroundColor: `${colors['primary-container']}4D`, 
                  color: colors.primary 
                }}
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
            <div className="text-center mt-3">
              <span className="text-xs transition-colors duration-500" style={{ color: `${colors['on-surface-variant']}99` }}>
                Conteúdo gerado por IA pode ser impreciso.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}