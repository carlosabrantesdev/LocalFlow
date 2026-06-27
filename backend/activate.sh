#!/bin/bash

# Cores para o terminal
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}     INICIANDO LOCALFLOW - ARCH LINUX     ${NC}"
echo ""

cleanup() {
    echo -e "\n${GREEN}Encerrando processos...${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "[1/2] Ligando o motor da IA (Uvicorn) em segundo plano..."
source ./venv/bin/activate

python -m uvicorn main:app --reload &
BACKEND_PID=$!

echo "Aguardando o servidor respirar..."
sleep 3

echo "[2/2] Conectando o Tunel (Ngrok)..."
echo "URL: shortcut-retaining-folk.ngrok-free.dev"
echo ""

ngrok http --url=shortcut-retaining-folk.ngrok-free.dev 8000