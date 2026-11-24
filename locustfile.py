import csv
import json
import logging
from datetime import datetime
from locust import HttpUser, task, between, events

# Variáveis globais para controle do arquivo CSV detalhado
arquivo_csv = None
escritor_csv = None


@events.test_start.add_listener
def iniciar_csv(environment, **kwargs):
    """Cria o arquivo CSV com cabeçalho assim que o teste iniciar."""
    global arquivo_csv, escritor_csv
    arquivo_csv = open("telemetria_detalhada.csv", mode="w", newline="", encoding="utf-8")
    escritor_csv = csv.writer(arquivo_csv, delimiter=";")
    escritor_csv.writerow([
        "Timestamp",
        "Rota",
        "Usuarios_Ativos",
        "Latencia_s",
        "CPU_IA_Percent",
        "RAM_IA_MB",
        "VRAM_IA_MB"
    ])


@events.test_stop.add_listener
def fechar_csv(environment, **kwargs):
    """Fecha e salva o arquivo CSV com segurança ao parar o teste."""
    if arquivo_csv:
        arquivo_csv.close()


def registrar_metricas_locust(telemetria, origem):
    """Envia CPU, RAM e VRAM como métricas oficiais para a tabela e gráficos do Locust."""
    cpu = telemetria.get("cpu_ia_percentual", 0.0)
    ram = telemetria.get("ram_ia_mb", 0.0)
    vram = telemetria.get("vram_ia_mb", 0.0)

    events.request.fire(
        request_type="TELEMETRIA",
        name=f"CPU IA (%) [{origem}]",
        response_time=cpu,
        response_length=0,
        exception=None
    )
    events.request.fire(
        request_type="TELEMETRIA",
        name=f"RAM IA (MB) [{origem}]",
        response_time=ram,
        response_length=0,
        exception=None
    )
    events.request.fire(
        request_type="TELEMETRIA",
        name=f"VRAM IA (MB) [{origem}]",
        response_time=vram,
        response_length=0,
        exception=None
    )


class UsuarioCliente(HttpUser):
    wait_time = between(1, 10)

    @task(3)
    def enviar_mensagem_chat(self):
        payload = {
            "mensagem": "Quais são os horários de funcionamento?",
            "estabelecimento_id": "academia_acao"
        }
        headers = {'Content-Type': 'application/json'}

        with self.client.post("/api/chat", data=json.dumps(payload), headers=headers, catch_response=True) as response:
            if response.status_code == 200:
                try:
                    dados = response.json()
                    telemetria = dados.get("telemetria", {})

                    # 1. Registra na tabela/relatório oficial do Locust
                    registrar_metricas_locust(telemetria, "chat")

                    # 2. Grava linha detalhada no CSV
                    if escritor_csv:
                        escritor_csv.writerow([
                            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            "/api/chat",
                            self.environment.runner.user_count,
                            telemetria.get("latencia_segundos", 0.0),
                            telemetria.get("cpu_ia_percentual", 0.0),
                            telemetria.get("ram_ia_mb", 0.0),
                            telemetria.get("vram_ia_mb", 0.0)
                        ])
                        arquivo_csv.flush()

                    # 3. Mantém o log no terminal
                    logging.info(
                        f"[CHAT OK] Latência: {telemetria.get('latencia_segundos')}s | "
                        f"CPU IA: {telemetria.get('cpu_ia_percentual')}% | "
                        f"RAM IA: {telemetria.get('ram_ia_mb')} MB | "
                        f"VRAM IA: {telemetria.get('vram_ia_mb')} MB"
                    )
                except Exception as e:
                    response.failure(f"Erro ao ler JSON de resposta: {e}")
            else:
                response.failure(f"Falha na requisição: {response.status_code}")

    @task(1)
    def consultar_telemetria_sistema(self):
        with self.client.get("/api/sistema-info", catch_response=True) as response:
            if response.status_code == 200:
                try:
                    telemetria = response.json()

                    # 1. Registra na tabela/relatório oficial do Locust
                    registrar_metricas_locust(telemetria, "sistema-info")

                    # 2. Grava linha detalhada no CSV
                    if escritor_csv:
                        escritor_csv.writerow([
                            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            "/api/sistema-info",
                            self.environment.runner.user_count,
                            0.0,
                            telemetria.get("cpu_ia_percentual", 0.0),
                            telemetria.get("ram_ia_mb", 0.0),
                            telemetria.get("vram_ia_mb", 0.0)
                        ])
                        arquivo_csv.flush()

                    # 3. Mantém o log no terminal
                    logging.info(
                        f"[SYSTEM-INFO] CPU IA: {telemetria.get('cpu_ia_percentual')}% | "
                        f"RAM IA: {telemetria.get('ram_ia_mb')} MB | "
                        f"VRAM IA: {telemetria.get('vram_ia_mb')} MB"
                    )
                except Exception as e:
                    response.failure(f"Erro ao ler JSON de telemetria: {e}")
            else:
                response.failure(f"Falha ao consultar telemetria: {response.status_code}")