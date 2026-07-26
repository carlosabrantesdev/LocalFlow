# LocalFlow AI

Uma plataforma SaaS multi-tenant que integra Inteligencia Artificial Generativa local a negocios fisicos. O LocalFlow utiliza modelos leves (Llama 3.2) processados localmente via Ollama para atuar como assistentes virtuais inteligentes, oferecendo respostas baseadas no contexto especifico de cada estabelecimento (RAG - Retrieval-Augmented Generation).

## O Projeto

Este projeto foi desenvolvido com foco em privacidade, baixo consumo de recursos (RAM/VRAM) e experiencia do usuario (UX/UI) nativa para dispositivos moveis. A arquitetura permite que multiplos clientes (estabelecimentos) utilizem a mesma infraestrutura de IA, com cada assistente acessando apenas a memoria (banco vetorial) e a persona correspondente a sua loja.

## Principais Funcionalidades

* Multi-tenancy RAG: Alternancia dinamica de base de dados e prompts de sistema no backend. A IA muda de personalidade e escopo de conhecimento dependendo da loja acessada no frontend.
* Gestos Nativos (Swipe): Interface responsiva construida no Next.js com suporte a troca de estabelecimentos atraves de gestos de arrasto horizontais (touch-pan) otimizados para mobile.
* Visao Computacional: Rota multimodal preparada para receber imagens e interpreta-las atraves do modelo llama3.2.
* Temas Dinamicos: Suporte completo a Modo Claro e Modo Escuro, com paletas de cores (Tailwind) geradas e aplicadas dinamicamente com base na identidade visual de cada cliente.
* Tunel de Conexao Estatico: Integracao com Ngrok Zero Trust, permitindo que o backend rode isolado localmente enquanto atende requisicoes publicas do frontend hospedado na nuvem.

## Tecnologias Utilizadas

Frontend
* Next.js / React
* Tailwind CSS
* Material Symbols

Backend & IA
* FastAPI
* LangChain
* ChromaDB
* Ollama
* Modelos: llama3.2 (Texto)

Infraestrutura
* Vercel (Frontend)
* Ngrok (Tunel HTTPS)

## Como Executar Localmente

### Pre-requisitos
* Node.js instalado.
* Python 3.10+ instalado.
* Ollama rodando localmente com o modelo llama3.2 baixado (comando: ollama pull llama3.2).
* Conta no Ngrok com um dominio estatico gerado.

### 1. Backend

Vá até o diretorio do backend e crie o seu ambiente virtual:

cd backend
python -m venv venv

Ative o ambiente virtual e instale as dependencias:

# Windows
.\venv\Scripts\activate

# Linux
source ./venv/bin/activate

# Instalacao
pip install fastapi uvicorn langchain langchain-ollama chromadb python-multipart

Utilize o script de automacao para iniciar o servico:
* Windows: execute iniciar.bat.
* Linux/Arch: execute ./iniciar.sh (apos aplicar chmod +x iniciar.sh).

### 2. Frontend

Va ate a pasta do frontend e instale as dependencias:

cd frontend
npm install

Crie um arquivo .env.local na raiz do frontend com o endereco do seu tunel Ngrok:

NEXT_PUBLIC_API_URL=https://seu-dominio-estatico.ngrok-free.app

Inicie o servidor de desenvolvimento:

npm run dev

Acesse o endereco local indicado no seu terminal.