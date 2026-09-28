# LocalFlow

## Como Executar Localmente

### Pre-requisitos
* Node.js instalado.
* Python 3.10+ instalado.
* Ollama rodando localmente com o modelo llama3.2 baixado.

### 1. Backend

Vá até o diretorio do backend e crie o seu ambiente virtual:

cd backend
python -m venv venv

Ative o ambiente virtual e instale as dependencias:

Windows: .\venv\Scripts\activate

Linux: source ./venv/bin/activate

pip install fastapi uvicorn psutil pynvml

### 2. Frontend

Vá até a pasta do frontend e instale as dependências:

cd frontend
npm install

Inicie o servidor de desenvolvimento:

npm run dev

Acesse o endereco local indicado no seu terminal.