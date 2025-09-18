# Configuração de Variáveis de Ambiente

## Arquivo .env

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/wishlist-backend

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Application
PORT=3000
NODE_ENV=development
```

## ⚠️ SOLUÇÃO PARA ERRO DE CONEXÃO MONGODB

Se você está recebendo o erro `ECONNREFUSED 127.0.0.1:27017`, siga estas opções:

### Opção 1: Usar MongoDB Atlas (Recomendado)
1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie uma conta gratuita
3. Crie um cluster gratuito
4. Obtenha a string de conexão
5. Configure no `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wishlist-backend?retryWrites=true&w=majority
```

### Opção 2: Instalar MongoDB Localmente
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS com Homebrew
brew install mongodb-community

# Windows
# Baixe do site oficial: https://www.mongodb.com/try/download/community
```

### Opção 3: Usar Docker
```bash
# Executar MongoDB em container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Configurar no .env
MONGODB_URI=mongodb://localhost:27017/wishlist-backend
```

## Variáveis Obrigatórias

### MONGODB_URI
- **Descrição**: URI de conexão com o MongoDB
- **Padrão**: `mongodb://localhost:27017/wishlist-backend`
- **Exemplo**: `mongodb://localhost:27017/wishlist-backend`

### JWT_SECRET
- **Descrição**: Chave secreta para assinar tokens JWT
- **Padrão**: `your-super-secret-jwt-key-change-in-production`
- **Importante**: Altere para uma chave segura em produção

### PORT
- **Descrição**: Porta em que a aplicação irá rodar
- **Padrão**: `3000`
- **Exemplo**: `3000`

### NODE_ENV
- **Descrição**: Ambiente de execução
- **Valores**: `development`, `production`, `test`
- **Padrão**: `development`

## Configuração do MongoDB

### Desenvolvimento Local
```env
MONGODB_URI=mongodb://localhost:27017/wishlist-backend
```

### MongoDB Atlas (Produção)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wishlist-backend?retryWrites=true&w=majority
```

### Docker
```env
MONGODB_URI=mongodb://mongo:27017/wishlist-backend
```

## Segurança

⚠️ **IMPORTANTE**:
- Nunca commite o arquivo `.env` no repositório
- Use chaves JWT seguras em produção
- Configure adequadamente as permissões do MongoDB
- Use variáveis de ambiente diferentes para cada ambiente (dev, staging, prod)
