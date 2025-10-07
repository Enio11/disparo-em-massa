#!/bin/bash

echo "🚀 Iniciando ambiente de desenvolvimento local..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js primeiro."
    echo "   Baixe em: https://nodejs.org/"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale npm primeiro."
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"
echo "✅ npm $(npm -v) encontrado"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
cd backend
npm install
cd ..
echo ""

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando a partir do .env.example..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edite o arquivo .env e configure:"
    echo "   - DB_HOST (use 'localhost' se tiver postgres local ou o IP do seu servidor)"
    echo "   - DB_PASSWORD"
    echo "   - EVOLUTION_API_URL"
    echo "   - EVOLUTION_API_KEY"
    echo ""
    read -p "Pressione ENTER para continuar após editar o .env..."
fi

# Iniciar aplicação
echo "🚀 Iniciando servidor de desenvolvimento..."
echo ""
echo "📱 A aplicação estará disponível em:"
echo "   http://localhost:3000"
echo ""
echo "⏹  Pressione CTRL+C para parar o servidor"
echo ""

cd backend
node src/app.js
