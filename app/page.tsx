"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';

type Mensagem = {
  autor: 'usuario' | 'ia';
  conteudo: string;
  tempoResposta?: number | null;
};

export default function PaginaAtendimento() {
  const URL_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const [temaEscuro, definirTemaEscuro] = useState(false);
  const [exibirInformacoesSistema, definirExibicaoInformacoesSistema] = useState(false);
  const [informacoesSistema, definirInformacoesSistema] = useState({
    cpu: '0.0',
    ram: '0.0',
    vram: '0.0'
  });
  
  const [mensagens, definirMensagens] = useState<Mensagem[]>([
    { autor: 'ia', conteudo: 'Olá! Como posso ajudar você a alcançar seus objetivos de treino hoje?', tempoResposta: null }
  ]);
  const [textoDigitado, definirTextoDigitado] = useState('');
  const [carregando, definirCarregando] = useState(false);
  const referenciaConversa = useRef<HTMLDivElement>(null);

  const buscarInformacoesSistema = useCallback(async () => {
    try {
      const resposta = await fetch(`${URL_API}/api/sistema-info`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      });
      const dados = await resposta.json();
      definirInformacoesSistema({
        cpu: dados.cpu_ia_percentual.toString(),
        ram: dados.ram_ia_mb.toString(),
        vram: dados.vram_ia_mb.toString()
      });
    } catch (erro) {
      console.error('Erro ao buscar info do sistema:', erro);
    }
  }, [URL_API]);

  useEffect(() => {
    if (referenciaConversa.current) {
      referenciaConversa.current.scrollTop = referenciaConversa.current.scrollHeight;
    }
  }, [mensagens]);

  useEffect(() => {
    if (!exibirInformacoesSistema) return;

    const intervaloAtualizacao = setInterval(buscarInformacoesSistema, 5000);

    return () => {
      clearInterval(intervaloAtualizacao);
    };
  }, [exibirInformacoesSistema, buscarInformacoesSistema]);

  const alternarInformacoesSistema = async () => {
    if (!exibirInformacoesSistema) {
      await buscarInformacoesSistema();
    }
    definirExibicaoInformacoesSistema(!exibirInformacoesSistema);
  };

  const enviarMensagem = async (texto: string) => {
    if (!texto.trim()) return;

    const mensagemUsuario = { autor: 'usuario' as const, conteudo: texto };
    definirMensagens(mensagensAnteriores => [...mensagensAnteriores, mensagemUsuario]);
    definirTextoDigitado('');
    definirCarregando(true);

    try {
      const resposta = await fetch(`${URL_API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: texto,
          estabelecimento_id: 'academia_acao'
        }),
      });
      const dados = await resposta.json();
      definirMensagens(mensagensAnteriores => [...mensagensAnteriores, { autor: 'ia' as const, conteudo: dados.resposta_ia, tempoResposta: dados.tempo_resposta }]);
    } catch {
      definirMensagens(mensagensAnteriores => [...mensagensAnteriores, { autor: 'ia' as const, conteudo: 'Desculpe, tive um problema técnico. Pode tentar novamente?' }]);
    } finally {
      definirCarregando(false);
    }
  };

  const cores = temaEscuro ? {
    fundo: '#0F172A',
    'texto': '#F8FAFC',
    'fundoPrincipal': '#020617',
    'borda': '#334155',
    'fundoSecundario': '#1E293B',
    'textoSecundario': '#94A3B8',
    'fundoDestaque': '#7C2D12',
    'textoDestaque': '#FFEDD5',
    corPrimaria: '#F97316',
    'textoSobrePrimaria': '#FFFFFF',
    'fundoSuave': '#0F172A'
  } : {
    fundo: '#F8FAFC',
    'texto': '#0F172A',
    'fundoPrincipal': '#FFFFFF',
    'borda': '#E2E8F0',
    'fundoSecundario': '#F1F5F9',
    'textoSecundario': '#475569',
    'fundoDestaque': '#FFEDD5',
    'textoDestaque': '#EA580C',
    corPrimaria: '#EA580C',
    'textoSobrePrimaria': '#FFFFFF',
    'fundoSuave': '#F8FAFC'
  };

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden antialiased transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: cores.fundo, color: cores['texto'], fontFamily: '"Manrope", sans-serif' }}
    >
      <div className="absolute inset-0 z-0 transition-colors duration-700 ease-in-out" 
           style={{ backgroundColor: cores.fundo }}>
      </div>

      <div className="relative z-10 flex items-center justify-center h-full w-full p-0 sm:p-4 md:p-8 overflow-hidden">
        <div
          className="w-full max-w-3xl h-full sm:h-[80vh] sm:min-h-[600px] backdrop-blur-md sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-b-0 sm:border transition-colors duration-700 ease-in-out"
          style={{
            backgroundColor: `${cores['fundoPrincipal']}E6`, // Aumentado ligeiramente a opacidade para compensar a perda do blur de fundo
            borderColor: `${cores['borda']}80`,
          }}
        >
          <div
            className="rounded-t-2xl sm:rounded-t-2xl rounded-none w-full border-b shadow-sm flex items-center justify-between px-4 sm:px-6 py-4 shrink-0 transition-colors duration-700 ease-in-out select-none"
            style={{
              backgroundColor: `${cores.fundo}CC`,
              borderColor: cores['borda'],
            }}
          >
            <div className="flex items-center gap-3 sm:gap-4 pointer-events-none">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0 shadow-sm overflow-hidden transition-colors duration-700 ease-in-out flex items-center justify-center font-semibold text-base sm:text-lg"
                style={{ backgroundColor: cores['fundoDestaque'], color: cores['textoDestaque'] }}
              >
                <img 
                  src="/academia.png" 
                  alt="Academia Ação" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-semibold m-0 leading-tight transition-colors duration-700 ease-in-out" style={{ color: cores['texto'] }}>
                  Academia Ação
                </h2>
                <span className="text-[10px] sm:text-xs m-0 leading-none mt-1 transition-colors duration-700 ease-in-out" style={{ color: cores.corPrimaria }}>
                  Sua dose diária de energia
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={alternarInformacoesSistema}
                className="p-2 w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-300 flex items-center justify-center relative"
                style={{ color: cores['textoSecundario'] }}
                title="Informações do Sistema"
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">computer</span>
                
                {exibirInformacoesSistema && (
                  <div 
                    className="absolute top-full right-0 mt-1 p-3 rounded-xl shadow-xl border z-50 min-w-[160px] animate-in fade-in zoom-in duration-200"
                    style={{ 
                      backgroundColor: cores['fundoPrincipal'],
                      borderColor: cores['borda'],
                      color: cores['texto']
                    }}
                  >
                    <div className="flex flex-col gap-1 text-xs sm:text-sm">
                      <div className="text-center font-bold mb-2 pb-1 border-b" style={{ borderColor: cores['borda'] }}>
                        Consumo da IA
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="opacity-70">CPU:</span>
                        <span className="font-mono font-medium">{informacoesSistema.cpu}%</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="opacity-70">RAM:</span>
                        <span className="font-mono font-medium">{informacoesSistema.ram} MB</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="opacity-70">VRAM:</span>
                        <span className="font-mono font-medium">{informacoesSistema.vram} MB</span>
                      </div>
                    </div>
                  </div>
                )}
              </button>

              <button
                onClick={() => definirTemaEscuro(!temaEscuro)}
                className="p-2 w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-300 flex items-center justify-center relative overflow-hidden"
                style={{ color: cores['textoSecundario'] }}
                title="Alternar Tema"
              >
                <span
                  className={`material-symbols-outlined absolute text-[24px] transform-gpu transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    temaEscuro
                      ? 'translate-y-8 opacity-0 rotate-[60deg] scale-50' 
                      : 'translate-y-0 opacity-100 rotate-0 scale-100'
                  }`}
                >
                  dark_mode
                </span>
                <span
                  className={`material-symbols-outlined absolute text-[24px] transform-gpu transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    temaEscuro
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
          <div ref={referenciaConversa} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-transparent flex flex-col cursor-auto custom-scrollbar transition-colors duration-700 ease-in-out">
            <div className="flex justify-center">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full transition-colors duration-700 ease-in-out"
                style={{ color: `${cores['textoSecundario']}99`, backgroundColor: `${cores['fundoSecundario']}80` }}
              >
                Hoje
              </span>
            </div>

            {mensagens.map((mensagem, indice) => (
              <div key={indice} className={`flex flex-col gap-1 mt-1 ${mensagem.autor === 'usuario' ? 'items-end self-end max-w-[85%] sm:max-w-[80%]' : 'items-start self-start max-w-[85%] sm:max-w-[80%]'}`}>
                <span className="text-xs mx-2 transition-colors duration-700 ease-in-out" style={{ color: cores['textoSecundario'] }}>
                  {mensagem.autor === 'usuario' ? 'Você' : 'Assistente Academia Ação'}
                </span>
                <div
                  className={`p-3 sm:p-4 rounded-2xl shadow-sm text-sm sm:text-base border transition-colors duration-700 ease-in-out ${mensagem.autor === 'usuario' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                  style={{
                    backgroundColor: mensagem.autor === 'usuario' ? cores.corPrimaria : cores['fundoSecundario'],
                    color: mensagem.autor === 'usuario' ? cores['textoSobrePrimaria'] : cores['texto'],
                    borderColor: `${cores['borda']}80`
                  }}
                >
                  {mensagem.conteudo}
                </div>
                {mensagem.autor === 'ia' && mensagem.tempoResposta && (
                  <span className="text-[10px] opacity-60 ml-1 mt-1 transition-colors duration-700 ease-in-out" style={{ color: cores['textoSecundario'] }}>
                    Respondido em {mensagem.tempoResposta}s
                  </span>
                )}
              </div>
            ))}

            {carregando && (
              <div className="flex flex-col items-start max-w-[80%] self-start gap-1 mt-2">
                <span className="text-xs ml-2 transition-colors duration-700 ease-in-out" style={{ color: cores['textoSecundario'] }}>Assistente Academia Ação</span>
                <div
                  className="p-4 rounded-2xl rounded-tl-sm shadow-sm text-base border flex gap-1.5 items-center h-12 transition-colors duration-700 ease-in-out"
                  style={{ backgroundColor: cores['fundoSecundario'], color: cores['texto'], borderColor: `${cores['borda']}80` }}
                >
                  <span className="w-2 h-2 rounded-full animate-bounce transition-colors duration-700 ease-in-out" style={{ backgroundColor: `${cores['textoSecundario']}99`, animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce transition-colors duration-700 ease-in-out" style={{ backgroundColor: `${cores['textoSecundario']}99`, animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce transition-colors duration-700 ease-in-out" style={{ backgroundColor: `${cores['textoSecundario']}99`, animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            {/* Recomendações embutidas */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 pt-1 shrink-0 self-start ml-2 scrollbar-hide">
              {['Planos de treino', 'Horários de funcionamento', 'Localização'].map((texto) => (
                <button
                  key={texto}
                  onClick={() => enviarMensagem(texto)}
                  className="shrink-0 border px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-700 ease-in-out whitespace-nowrap shadow-sm hover:opacity-80"
                  style={{ borderColor: `${cores.corPrimaria}4D`, backgroundColor: `${cores.corPrimaria}0D`, color: cores.corPrimaria }}
                >
                  {texto}
                </button>
              ))}
            </div>
          </div>

          {/* Área de entrada */}
          <div
            className="border-t p-3 sm:p-4 md:p-6 shrink-0 transition-colors duration-700 ease-in-out cursor-auto"
            style={{ backgroundColor: `${cores.fundo}E6`, borderColor: cores['borda'] }}
          >
            <div
              className="flex items-center gap-2 sm:gap-3 rounded-full px-3 py-2 sm:px-4 sm:py-3 border focus-within:ring-2 shadow-sm transition-colors duration-700 ease-in-out"
              style={{ backgroundColor: cores['fundoSuave'], borderColor: cores['borda'] }}
            >
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm sm:text-base p-1 outline-none transition-colors duration-700 ease-in-out placeholder:transition-colors placeholder:duration-700"
                placeholder="Pergunte sobre Academia Ação..."
                type="text"
                value={textoDigitado}
                onChange={(evento) => definirTextoDigitado(evento.target.value)}
                onKeyDown={(evento) => evento.key === 'Enter' && enviarMensagem(textoDigitado)}
                style={{ color: cores['texto'] }}
              />
              <button
                onClick={() => enviarMensagem(textoDigitado)}
                className="rounded-full p-2 transform-gpu transition-[transform,background-color,color] duration-300 active:scale-90 flex shrink-0 hover:opacity-80"
                style={{ backgroundColor: `${cores['fundoDestaque']}4D`, color: cores.corPrimaria }}
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">send</span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-1 sm:mt-3 select-none opacity-40 hover:opacity-70 transition-opacity duration-300">
              <span
                className="text-[9px] sm:text-[11px] font-medium transition-colors duration-700 ease-in-out"
                style={{ color: cores['texto'] }}
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
