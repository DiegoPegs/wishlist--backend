# Scripts de Gerenciamento de Processos

Este documento descreve os scripts disponíveis para gerenciar processos do projeto wishlist-backend.

## 📋 Scripts Disponíveis

### 1. `kill-all.sh` - Script Principal
**Comando:** `./kill-all.sh` ou `npm run kill-all`

**Descrição:** Script inteligente que mata todas as instâncias relacionadas ao projeto de forma segura.

**O que faz:**
- ✅ Mata processos Node.js relacionados ao wishlist-backend
- ✅ Mata processos NestJS (start, build, debug)
- ✅ Mata processos TypeScript (ts-node, tsc --watch)
- ✅ Mata processos na porta 3000 (porta padrão)
- ✅ Mata processos Jest (testes)
- ✅ Mata processos Nodemon
- ✅ Mata processos ESLint relacionados
- ✅ Verificação final e relatório de status

**Vantagens:**
- 🎯 Específico para o projeto (não afeta outros projetos Node.js)
- 🔍 Detalhado com logs coloridos
- ✅ Verificação final de limpeza
- 📋 Comandos úteis no final

### 2. `kill-port.sh` - Script de Porta
**Comando:** `./kill-port.sh`

**Descrição:** Script simples que mata apenas processos na porta 3000.

**O que faz:**
- ✅ Mata processos na porta 3000
- ✅ Aguarda liberação da porta
- ✅ Pronto para reiniciar

### 3. `kill-emergency.sh` - Script de Emergência
**Comando:** `./kill-emergency.sh`

**Descrição:** Script de emergência que mata TODOS os processos Node.js do sistema.

**⚠️ ATENÇÃO:** Este script mata TODOS os processos Node.js, não apenas do projeto!

**Quando usar:**
- 🚨 Quando outros scripts não funcionam
- 🚨 Quando há muitos processos Node.js travados
- 🚨 Em situações de emergência

## 🚀 Como Usar

### Método 1: Scripts Diretos
```bash
# Script principal (recomendado)
./kill-all.sh

# Apenas porta 3000
./kill-port.sh

# Emergência (cuidado!)
./kill-emergency.sh
```

### Método 2: Via NPM
```bash
# Script principal
npm run kill-all

# Reiniciar aplicação
npm run restart
```

### Método 3: Comandos Manuais
```bash
# Ver processos relacionados
ps aux | grep wishlist

# Ver porta 3000
lsof -i :3000

# Matar processo específico
kill -9 <PID>
```

## 🔧 Troubleshooting

### Problema: Script não executa
```bash
# Dar permissão de execução
chmod +x kill-all.sh
chmod +x kill-port.sh
chmod +x kill-emergency.sh
```

### Problema: Ainda há processos rodando
```bash
# Verificar manualmente
ps aux | grep wishlist

# Matar processo específico
kill -9 <PID>

# Ou usar script de emergência
./kill-emergency.sh
```

### Problema: Porta ainda ocupada
```bash
# Verificar porta
lsof -i :3000

# Aguardar um pouco e tentar novamente
sleep 5
./kill-all.sh
```

## 📝 Logs e Saída

Os scripts fornecem saída colorida para facilitar o entendimento:
- 🔍 **Azul**: Informações de busca
- ✅ **Verde**: Sucesso
- ⚠️ **Amarelo**: Avisos
- 💀 **Vermelho**: Ações de finalização
- 🚨 **Vermelho**: Emergência

## 🎯 Recomendações

1. **Use `kill-all.sh`** para a maioria dos casos
2. **Use `kill-port.sh`** apenas quando souber que só a porta está ocupada
3. **Use `kill-emergency.sh`** apenas em emergências
4. **Sempre verifique** se os processos foram finalizados
5. **Aguarde alguns segundos** antes de reiniciar a aplicação
