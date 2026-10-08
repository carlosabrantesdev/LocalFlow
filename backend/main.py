from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import psutil
import win32pdh
import time

ESTABELECIMENTO_INFO = {
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
        "Seja profissional. "
        "Responda apenas ao que foi perguntado. "
        "Não invente preços, horários ou serviços. "
        "Não use frases motivacionais nem respostas longas. "
        "Você foi feito para informar sobre a academia, planos de treino, "
        "horários de funcionamento, localização, preços e serviços oferecidos."
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


def formatar_informacoes(info_list):
    return "\n".join(info_list)


def obter_processo_ia():
    for proc in psutil.process_iter(["pid", "name"]):
        try:
            nome = proc.info["name"]
            if nome and nome.lower() == "llama-server.exe":
                return proc
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    return None


def capturar_snapshot_cpu(processo):
    if not processo:
        return 0.0
    try:
        t = processo.cpu_times()
        return t.user + t.system
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        return 0.0


def capturar_vram_processo(processo):
    if not processo:
        return 0.0

    try:
        pid = processo.pid
        query = win32pdh.OpenQuery()
        counter = win32pdh.AddCounter(
            query,
            r"\GPU Process Memory(*)\Dedicated Usage"
        )

        win32pdh.CollectQueryData(query)
        time.sleep(0.05)
        win32pdh.CollectQueryData(query)

        dados = win32pdh.GetFormattedCounterArray(
            counter,
            win32pdh.PDH_FMT_LARGE
        )

        total_bytes = 0
        for instancia, valor in dados.items():
            if instancia.startswith(f"pid_{pid}_"):
                total_bytes += valor

        win32pdh.RemoveCounter(counter)
        win32pdh.CloseQuery(query)

        return round(total_bytes / (1024 ** 2), 2)

    except Exception:
        return 0.0


def capturar_telemetria(processo, cpu_tempo_inicial, duracao_segundos):
    ram_usada_mb = 0.0

    cpu_tempo_final = capturar_snapshot_cpu(processo)
    delta_cpu_tempo = max(0.0, cpu_tempo_final - cpu_tempo_inicial)

    qtd_cores = psutil.cpu_count() or 1
    if duracao_segundos > 0:
        cpu_percent = (delta_cpu_tempo / duracao_segundos) * 100 / qtd_cores
    else:
        cpu_percent = 0.0

    if processo:
        try:
            ram_info = processo.memory_full_info()
            ram_usada_mb = ram_info.uss / (1024 ** 2)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    vram_usada_mb = capturar_vram_processo(processo)

    return {
        "cpu_ia_percentual": round(min(cpu_percent, 100.0), 2),
        "ram_ia_mb": round(ram_usada_mb, 2),
        "vram_ia_mb": vram_usada_mb
    }


@app.get("/api/system-info")
async def get_system_info():
    processo = obter_processo_ia()
    cpu_ini = capturar_snapshot_cpu(processo)
    tempo_inicio = time.time()

    time.sleep(0.1)

    duracao = time.time() - tempo_inicio

    metricas = capturar_telemetria(processo, cpu_ini, duracao)

    metricas["processo"] = "llama-server.exe"
    metricas["pid"] = processo.pid if processo else None
    metricas["processo_encontrado"] = processo is not None

    return metricas


class RequisicaoChat(BaseModel):
    mensagem: str
    estabelecimento_id: str


@app.post("/api/chat")
async def responder_cliente(requisicao: RequisicaoChat):
    try:
        processo = obter_processo_ia()
        cpu_tempo_inicial = capturar_snapshot_cpu(processo)
        tempo_inicio = time.time()

        contexto_loja = formatar_informacoes(ESTABELECIMENTO_INFO["info"])

        prompt = f"""
{ESTABELECIMENTO_INFO['persona']}

Use APENAS as informações abaixo para responder.
Se não souber, diga que não sabe responder.

Informações da loja:
{contexto_loja}

Mensagem do Cliente:
{requisicao.mensagem}

Sua resposta:
"""

        resposta_ollama = ollama.generate(
            model="llama3.2",
            prompt=prompt,
            options={
                "temperature": 0.3,
                "num_ctx": 1024,
                "num_gpu": 0
            }
        )

        tempo_fim = time.time()
        duracao = tempo_fim - tempo_inicio
        processo = obter_processo_ia()

        metricas_hardware = capturar_telemetria(
            processo,
            cpu_tempo_inicial,
            duracao
        )

        resposta = resposta_ollama["response"]
        tempo_resposta_segundos = round(duracao, 2)
        metricas_hardware["latencia_segundos"] = tempo_resposta_segundos

        metricas_hardware["processo"] = "llama-server.exe"
        metricas_hardware["pid"] = processo.pid if processo else None
        metricas_hardware["processo_encontrado"] = processo is not None

        return {
            "resposta_ia": resposta,
            "tempo_resposta": tempo_resposta_segundos,
            "telemetria": metricas_hardware
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )