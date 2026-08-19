from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
import psutil
import pynvml
import time

# Informações da Academia Ação
ACADEMIA_ACAO_INFO = {
    "info": [
        "Localização: Avenida Independência, 450, Centro, Alexandria - RN.",
        "Horário de funcionamento: Todos os dias, das 05h às 23h.",
        "Plano mensal: R$ 120,00.",
        "Plano trimestral: R$ 330,00.",
        "Plano anual: R$ 1.200,00.",
        "Avaliação física: R$ 50,00.",
        "Plano de treino Iniciante: 3 treinos por semana com foco em adaptação muscular.",
        "Plano de treino Avançado: 6 treinos por semana com foco em hipertrofia e condicionamento.",
        "FitDance: Terça e quinta às 19h.",
        "Funcional: Segunda, quarta e sexta às 18h.",
        "Spinning: Segunda a sexta às 06h e às 20h.",
        "Alongamento: Sábado às 09h.",
        "Musculação e cardio inclusos em todos os planos."
    ],
    "persona": (
        "Você é o atendente virtual da Academia Ação. "
        "Seja sério, objetivo e profissional. "
        "Responda apenas ao que foi perguntado. "
        "Utilize somente as informações fornecidas. "
        "Não invente preços, horários ou serviços. "
        "Não use frases motivacionais nem respostas longas."
    )
}

app = FastAPI(title="API LocalFlow")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo de IA
llm = Ollama(
    model="llama3.2", 
    temperature=0.3,
    num_ctx=1024
)

def formatar_informacoes(info_list):
    return "\n".join(info_list)

def capturar_telemetria_ia():
    cpu_percent = 0.0
    ram_usada_mb = 0.0
    vram_usada_mb = 0.0
    
    for proc in psutil.process_iter(['pid', 'name']):
        if proc.info['name'] and 'llama-server' in proc.info['name'].lower():
            try:
                cpu_percent = proc.cpu_percent(interval=0.1) / psutil.cpu_count()
                ram_info = proc.memory_full_info()
                ram_usada_mb += ram_info.uss / (1024**2)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

    try:
        pynvml.nvmlInit()
        handle = pynvml.nvmlDeviceGetHandleByIndex(0)
        
        # Pega a lista de todos os processos que estão usando a placa de vídeo
        processos_gpu = pynvml.nvmlDeviceGetComputeRunningProcesses(handle)
        
        for proc_gpu in processos_gpu:
            try:
                # Descobre o nome do processo atrelado àquele PID na GPU
                nome_proc = psutil.Process(proc_gpu.pid).name().lower()
                if 'llama-server' in nome_proc:
                    # Soma a VRAM apenas se o processo for o llama-server
                    vram_usada_mb += proc_gpu.usedGpuMemory / (1024**2)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
                
        pynvml.nvmlShutdown()
    except Exception as e:
        print(f"Aviso GPU: Não foi possível capturar processo da GPU. {e}")

    return {
        "cpu_ia_percentual": round(cpu_percent, 2),
        "ram_ia_mb": round(ram_usada_mb, 2),
        "vram_ia_mb": round(vram_usada_mb, 2)
    }

@app.get("/api/system-info")
async def get_system_info():
    return capturar_telemetria_ia()

class RequisicaoChat(BaseModel):
    mensagem: str
    estabelecimento_id: str

@app.post("/api/chat")
async def responder_cliente(requisicao: RequisicaoChat):
    try:
        # Inicia o cronômetro para medir o tempo de resposta
        tempo_inicio = time.time()
        
        contexto_loja = formatar_informacoes(ACADEMIA_ACAO_INFO["info"])
        
        template_dinamico = f"""{ACADEMIA_ACAO_INFO['persona']}
        Use APENAS as informações abaixo para responder. Se não souber, diga que não sabe responder.
        
        Informações da loja:
        {contexto_loja}
        
        Mensagem do Cliente: {{question}}
        
        Sua resposta:"""
        
        prompt_dinamico = PromptTemplate.from_template(template_dinamico)
        
        qa_chain = (
            {"question": RunnablePassthrough()}
            | prompt_dinamico
            | llm
            | StrOutputParser()
        )
        
        # Chamada do Llama 3.2 via Ollama
        resposta = qa_chain.invoke(requisicao.mensagem)
        
        # Para o cronômetro e coleta o estado do hardware logo após a inferência
        tempo_fim = time.time()
        metricas_hardware = capturar_telemetria_ia()
        tempo_resposta_segundos = round(tempo_fim - tempo_inicio, 2)
        
        # Anexa o tempo de resposta às métricas
        metricas_hardware["latencia_segundos"] = tempo_resposta_segundos

        return {
            "resposta_ia": resposta,
            "telemetria": metricas_hardware
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))