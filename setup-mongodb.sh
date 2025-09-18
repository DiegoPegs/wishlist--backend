#!/bin/bash

echo "🚀 Configurando MongoDB para o projeto Wishlist Backend"
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Instale o Docker primeiro:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Instale o Docker Compose primeiro:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"
echo ""

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cat > .env << EOF
# Database
MONGODB_URI=mongodb://localhost:27017/wishlist-backend

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Application
PORT=3000
NODE_ENV=development
EOF
    echo "✅ Arquivo .env criado"
else
    echo "✅ Arquivo .env já existe"
fi

echo ""

# Iniciar MongoDB com Docker Compose
echo "🐳 Iniciando MongoDB com Docker Compose..."
docker-compose up -d mongodb

echo ""
echo "⏳ Aguardando MongoDB inicializar..."
sleep 10

# Verificar se MongoDB está rodando
if docker-compose ps mongodb | grep -q "Up"; then
    echo "✅ MongoDB está rodando!"
    echo ""
    echo "📊 Informações de conexão:"
    echo "   - Host: localhost"
    echo "   - Porta: 27017"
    echo "   - Database: wishlist-backend"
    echo "   - URI: mongodb://localhost:27017/wishlist-backend"
    echo ""
    echo "🌐 Interface web (opcional):"
    echo "   - Mongo Express: http://localhost:8081"
    echo "   - Usuário: admin"
    echo "   - Senha: admin"
    echo ""
    echo "🚀 Agora você pode executar:"
    echo "   npm run start"
    echo ""
    echo "🛑 Para parar o MongoDB:"
    echo "   docker-compose down"
else
    echo "❌ Erro ao iniciar MongoDB. Verifique os logs:"
    echo "   docker-compose logs mongodb"
fi

