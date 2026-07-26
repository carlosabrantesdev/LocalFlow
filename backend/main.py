from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

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

# 3. Modelo de IA
llm = Ollama(
    model="llama3.2", 
    temperature=0.3,
    num_ctx=1024
)



def formatar_informacoes(info_list):
    return "\n".join(info_list)

# 5. Modelo de Requisição (Exige ID Estabelecimento)
class RequisicaoChat(BaseModel):
    mensagem: str
    estabelecimento_id: str

# 6. Rota da API Dinâmica
@app.post("/api/chat")
async def responder_cliente(requisicao: RequisicaoChat):
    try:
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
        
        resposta = qa_chain.invoke(requisicao.mensagem)
        return {"resposta_ia": resposta}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))