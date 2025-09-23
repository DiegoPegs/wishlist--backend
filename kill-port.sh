#!/bin/bash

# Script para matar processos na porta 3000
echo "🔍 Procurando processos na porta 3000..."

# Encontrar PIDs usando a porta 3000
PIDS=$(lsof -ti:3000)

if [ -z "$PIDS" ]; then
    echo "✅ Nenhum processo encontrado na porta 3000"
else
    echo "🔍 Processos encontrados: $PIDS"
    echo "💀 Matando processos..."

    # Matar todos os processos encontrados
    for PID in $PIDS; do
        echo "   Matando processo $PID"
        kill -9 $PID
    done

    echo "✅ Processos mortos com sucesso!"
fi

# Aguardar um pouco para garantir que a porta foi liberada
sleep 2

echo "🚀 Pronto para iniciar a aplicação!"
