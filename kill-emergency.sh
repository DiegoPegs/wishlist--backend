#!/bin/bash

# Script de emergência para matar TODOS os processos Node.js
echo "🚨 MODO EMERGÊNCIA - Matando TODOS os processos Node.js..."

# Matar todos os processos Node.js
echo "💀 Matando todos os processos Node.js..."
pkill -f node

# Aguardar
sleep 2

# Verificar se ainda há processos
REMAINING=$(pgrep node)
if [ -n "$REMAINING" ]; then
    echo "💀 Forçando finalização de processos restantes..."
    pkill -9 -f node
fi

echo "✅ Todos os processos Node.js foram finalizados!"
echo "⚠️  ATENÇÃO: Este script mata TODOS os processos Node.js do sistema!"
