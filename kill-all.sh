#!/bin/bash

# Script para matar todas as instâncias do projeto wishlist-backend
echo "🔍 Procurando e matando todas as instâncias do projeto..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para matar processos por nome
kill_by_name() {
    local process_name=$1
    local description=$2

    echo -e "${BLUE}🔍 Procurando processos: $description${NC}"

    # Encontrar PIDs pelo nome do processo
    PIDS=$(pgrep -f "$process_name" 2>/dev/null)

    if [ -z "$PIDS" ]; then
        echo -e "${GREEN}✅ Nenhum processo '$process_name' encontrado${NC}"
    else
        echo -e "${YELLOW}🔍 Processos encontrados: $PIDS${NC}"
        echo -e "${RED}💀 Matando processos...${NC}"

        # Matar todos os processos encontrados
        for PID in $PIDS; do
            echo -e "   ${RED}Matando processo $PID ($process_name)${NC}"
            kill -9 $PID 2>/dev/null
        done

        echo -e "${GREEN}✅ Processos '$process_name' mortos com sucesso!${NC}"
    fi
}

# Função para matar processos por porta
kill_by_port() {
    local port=$1
    local description=$2

    echo -e "${BLUE}🔍 Procurando processos na porta $port ($description)${NC}"

    # Encontrar PIDs usando a porta
    PIDS=$(lsof -ti:$port 2>/dev/null)

    if [ -z "$PIDS" ]; then
        echo -e "${GREEN}✅ Nenhum processo encontrado na porta $port${NC}"
    else
        echo -e "${YELLOW}🔍 Processos encontrados na porta $port: $PIDS${NC}"
        echo -e "${RED}💀 Matando processos...${NC}"

        # Matar todos os processos encontrados
        for PID in $PIDS; do
            echo -e "   ${RED}Matando processo $PID (porta $port)${NC}"
            kill -9 $PID 2>/dev/null
        done

        echo -e "${GREEN}✅ Processos na porta $port mortos com sucesso!${NC}"
    fi
}

# 1. Matar processos Node.js relacionados ao projeto
kill_by_name "node.*wishlist-backend" "Node.js do wishlist-backend"
kill_by_name "nest.*start" "NestJS start"
kill_by_name "ts-node.*wishlist" "TypeScript Node do projeto"

# 2. Matar processos por porta (3000 é a porta padrão do NestJS)
kill_by_port 3000 "Porta padrão do NestJS"

# 3. Matar processos Jest (testes)
kill_by_name "jest.*wishlist" "Jest (testes)"

# 4. Matar processos de desenvolvimento
kill_by_name "nodemon.*wishlist" "Nodemon"
kill_by_name "tsc.*--watch" "TypeScript Compiler watch"

# 5. Matar processos específicos do NestJS
kill_by_name "nest.*build" "NestJS build"
kill_by_name "nest.*start.*debug" "NestJS debug"

# 6. Matar processos de linting
kill_by_name "eslint.*wishlist" "ESLint"

# 7. Verificar se ainda há processos Node.js rodando
echo -e "${BLUE}🔍 Verificando se ainda há processos Node.js rodando...${NC}"
REMAINING_NODE=$(pgrep -f "node.*wishlist" 2>/dev/null)

if [ -n "$REMAINING_NODE" ]; then
    echo -e "${YELLOW}⚠️  Ainda há processos Node.js relacionados: $REMAINING_NODE${NC}"
    echo -e "${RED}💀 Forçando finalização...${NC}"
    for PID in $REMAINING_NODE; do
        # Verificar se é realmente um processo Node.js
        if ps -p $PID -o comm= | grep -q "node"; then
            kill -9 $PID 2>/dev/null
            echo -e "   ${RED}Forçando finalização do processo $PID${NC}"
        fi
    done
else
    echo -e "${GREEN}✅ Nenhum processo Node.js relacionado encontrado${NC}"
fi

# Aguardar um pouco para garantir que os processos foram finalizados
echo -e "${BLUE}⏳ Aguardando finalização dos processos...${NC}"
sleep 3

# Verificação final
echo -e "${BLUE}🔍 Verificação final...${NC}"
FINAL_CHECK=$(pgrep -f "node.*wishlist" 2>/dev/null)

if [ -z "$FINAL_CHECK" ]; then
    echo -e "${GREEN}🎉 Todos os processos Node.js do projeto foram finalizados com sucesso!${NC}"
    echo -e "${GREEN}🚀 Pronto para iniciar a aplicação novamente!${NC}"
else
    echo -e "${YELLOW}⚠️  Ainda há alguns processos Node.js relacionados: $FINAL_CHECK${NC}"
    echo -e "${YELLOW}   Execute 'ps aux | grep node' para verificar manualmente${NC}"
fi

echo -e "${BLUE}📋 Comandos úteis:${NC}"
echo -e "   ${YELLOW}ps aux | grep wishlist${NC} - Ver processos relacionados"
echo -e "   ${YELLOW}lsof -i :3000${NC} - Verificar porta 3000"
echo -e "   ${YELLOW}npm run start:dev${NC} - Iniciar em modo desenvolvimento"
echo -e "   ${YELLOW}npm run restart${NC} - Reiniciar aplicação"
