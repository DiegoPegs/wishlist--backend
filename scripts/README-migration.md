# Script de Migração - Valores de Relationship

Este script migra os valores antigos do campo `relationship` para os novos valores do enum `RelationshipType`.

## Mapeamento de Valores

| Valor Antigo | Valor Novo | Descrição |
|--------------|------------|-----------|
| `son` | `CHILD` | Filho |
| `daughter` | `CHILD` | Filha |
| `brother` | `SIBLING` | Irmão |
| `sister` | `SIBLING` | Irmã |
| `nephew` | `NIBLING` | Sobrinho |
| `niece` | `NIBLING` | Sobrinha |
| `grandson` | `NIBLING` | Neto |
| `granddaughter` | `NIBLING` | Neta |
| `other` | `OTHER` | Outro |

## Como Executar

### Pré-requisitos

1. Certifique-se de que o MongoDB está rodando
2. Configure a variável de ambiente `MONGODB_URI` no arquivo `.env`
3. Instale as dependências: `npm install`

### Execução

```bash
# Usando Node.js diretamente
node scripts/migrate-relationship-values.js

# Ou usando npm script (se configurado)
npm run migrate:relationship
```

### Saída Esperada

```
🚀 Iniciando migração dos valores de relationship...
📡 Conectando ao MongoDB: mongodb://localhost:27017/wishlist-backend
✅ Conectado ao MongoDB
📊 Encontrados 5 dependentes com relationship definido
🔄 Migrado: "son" -> "CHILD" para dependente 507f1f77bcf86cd799439011
🔄 Migrado: "daughter" -> "CHILD" para dependente 507f1f77bcf86cd799439012
🔄 Migrado: "brother" -> "SIBLING" para dependente 507f1f77bcf86cd799439013
✅ Valor já atualizado: "OTHER" para dependente 507f1f77bcf86cd799439014
⚠️  Valor desconhecido encontrado: "cousin" para dependente 507f1f77bcf86cd799439015

📈 Resumo da migração:
✅ Atualizados: 3
⏭️  Pulados: 2
❌ Erros: 0
📊 Total processados: 5

🎉 Migração concluída com sucesso!
🔌 Conexão com MongoDB fechada
✨ Script finalizado
```

## Segurança

- O script faz backup automático dos dados antes da migração
- Valores desconhecidos são pulados (não causam erro)
- O script é idempotente (pode ser executado múltiplas vezes)
- Valores já migrados são detectados e pulados

## Troubleshooting

### Erro de Conexão
```
❌ Erro durante a migração: MongoNetworkError: failed to connect to server
```
**Solução**: Verifique se o MongoDB está rodando e se a `MONGODB_URI` está correta.

### Valores Desconhecidos
```
⚠️  Valor desconhecido encontrado: "cousin" para dependente 507f1f77bcf86cd799439015
```
**Solução**: Adicione o mapeamento no objeto `RELATIONSHIP_MAPPING` ou atualize manualmente no banco.

### Permissões
```
❌ Erro ao atualizar dependente: MongoError: not authorized
```
**Solução**: Verifique as permissões do usuário do MongoDB para escrita na coleção `users`.
