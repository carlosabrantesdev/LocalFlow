# LocalFlow AI

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
