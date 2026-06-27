from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.llms import Ollama
from langchain_ollama import OllamaEmbeddings 
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from estabelecimentos import estabelecimentos_info

# 1. Inicializando o FastAPI
app = FastAPI(title="API LocalFlow")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Construindo as "Múltiplas Memórias" (Bancos Vetoriais)
print("Carregando modelo de embeddings (nomic-embed-text)...")
embeddings = OllamaEmbeddings(model="nomic-embed-text")

# Vamos guardar um Retriever (pesquisador) diferente para cada loja
retrievers = {}
for est_id, dados in estabelecimentos_info.items():
    print(f"Criando banco de memória para: {est_id}")
    # O collection_name garante que os dados de um não se misturem com o do outro
    vectorstore = Chroma.from_texts(
        dados["info"], 
        embeddings, 
        collection_name=est_id 
    )
    retrievers[est_id] = vectorstore.as_retriever(search_kwargs={"k": 2})

# 4. Motor de IA (Leve e Rápido)
llm = Ollama(
    model="llama3.2", 
    temperature=0.3,
    num_ctx=1024
)

def formatar_documentos(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# 5. Novo Modelo de Requisição (Agora exige o ID do front)
class RequisicaoChat(BaseModel):
    mensagem: str
    estabelecimento_id: str # <-- O Frontend é obrigado a mandar isso agora

# 6. Rota da API Dinâmica
@app.post("/api/chat")
async def responder_cliente(requisicao: RequisicaoChat):
    # Verifica se a loja enviada pelo Next.js existe no banco
    if requisicao.estabelecimento_id not in estabelecimentos_info:
        raise HTTPException(status_code=404, detail="Estabelecimento não encontrado no sistema.")
    
    try:
        # Pega as informações exclusivas daquela loja
        dados_loja = estabelecimentos_info[requisicao.estabelecimento_id]
        retriever_da_loja = retrievers[requisicao.estabelecimento_id]
        
        # Monta o prompt dinamicamente usando a persona certa
        template_dinamico = f"""{dados_loja['persona']}
        Use APENAS as informações abaixo para responder. Se não souber, peça para ligar no local.
        
        Informações da loja:
        {{context}}
        
        Mensagem do Cliente: {{question}}
        
        Sua resposta:"""
        
        prompt_dinamico = PromptTemplate.from_template(template_dinamico)
        
        # Monta o raciocínio na hora
        qa_chain = (
            {"context": retriever_da_loja | formatar_documentos, "question": RunnablePassthrough()}
            | prompt_dinamico
            | llm
            | StrOutputParser()
        )
        
        # Gera a resposta
        resposta = qa_chain.invoke(requisicao.mensagem)
        return {"resposta_ia": resposta}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))