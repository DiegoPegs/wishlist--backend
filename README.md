# 🎁 Wishlist Backend

Sistema completo de wishlist com autenticação JWT, gerenciamento de dependentes e sistema de reservas.

## 🚀 Funcionalidades

### 🔐 Autenticação e Usuários
- **Registro e Login** com JWT
- **Integração AWS Cognito** para gerenciamento de senhas
- **Perfis de Usuário** com informações pessoais
- **Sistema de Seguidores** (follow/unfollow)

### 👨‍👩‍👧‍👦 Gerenciamento de Dependentes
- **Criação de Dependentes** por guardiões
- **Sistema de Guardiões** com convites
- **Controle de Permissões** granular
- **Remoção Segura** de guardiões (com validação do último guardião)

### 📝 Wishlists e Itens
- **Criação de Wishlists** pessoais e para dependentes
- **Gerenciamento de Itens** com metadados completos
- **Tipos de Itens**: Produtos específicos e genéricos
- **Controle de Quantidade** desejada e reservada
- **Arquivamento e Restauração** de wishlists

### 🛒 Sistema de Reservas
- **Reserva de Itens** com validação de quantidade
- **Operações Atômicas** para consistência de dados
- **Status de Reserva** (reservado, confirmado, cancelado)
- **Histórico de Reservas** por usuário

### 💬 Sistema de Conversas
- **Conversas Anônimas** entre usuários
- **Mensagens** com timestamps
- **Controle de Participantes**

### 📧 Sistema de Convites
- **Convites para Guardiões** via email
- **Tokens de Convite** com expiração
- **Aceitação de Convites** com validação

## 🛠️ Tecnologias

- **Backend**: NestJS + TypeScript
- **Banco de Dados**: MongoDB + Mongoose
- **Autenticação**: JWT + AWS Cognito
- **Validação**: class-validator + class-transformer
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest + Supertest

## 📋 Pré-requisitos

- Node.js 18+
- MongoDB 5.0+
- AWS Cognito (opcional)
- npm ou yarn

## ⚙️ Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/wishlist-backend.git
cd wishlist-backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/wishlist

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro

# AWS Cognito (opcional)
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=seu-user-pool-id
COGNITO_CLIENT_ID=seu-client-id

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

### 4. Configure o MongoDB
```bash
# Opção 1: Docker (recomendado)
docker-compose up -d

# Opção 2: Instalação local
./setup-mongodb.sh
```

### 5. Execute o projeto
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📚 Documentação da API

Após iniciar o servidor, acesse:
- **Swagger UI**: http://localhost:3000/api
- **JSON Schema**: http://localhost:3000/api-json

## 🏗️ Arquitetura

```
src/
├── application/          # Casos de uso e DTOs
│   ├── dtos/            # Data Transfer Objects
│   └── use-cases/       # Lógica de negócio
├── domain/              # Entidades e interfaces
│   ├── entities/        # Entidades de domínio
│   ├── enums/           # Enumerações
│   └── repositories/    # Interfaces dos repositórios
└── infrastructure/      # Implementações
    ├── controllers/     # Controllers REST
    ├── database/        # Schemas e repositórios MongoDB
    └── services/        # Serviços externos
```

## 🔒 Segurança

- **Senhas**: Hash com bcrypt + AWS Cognito
- **JWT**: Tokens seguros com expiração
- **Validação**: DTOs com class-validator
- **Sanitização**: Prevenção de XSS e injection
- **CORS**: Configurado para produção

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## 📦 Scripts Disponíveis

```bash
npm run start          # Inicia em produção
npm run start:dev      # Inicia em desenvolvimento
npm run start:debug    # Inicia em modo debug
npm run build          # Compila o projeto
npm run test           # Executa testes
npm run test:e2e       # Executa testes e2e
npm run lint           # Executa linter
npm run format         # Formata código
```

## 🚀 Deploy

### Docker
```bash
docker build -t wishlist-backend .
docker run -p 3000:3000 wishlist-backend
```

### Heroku
```bash
# Configure as variáveis de ambiente no Heroku
heroku config:set MONGODB_URI=sua-uri-mongodb
heroku config:set JWT_SECRET=seu-jwt-secret

# Deploy
git push heroku main
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Diego** - *Desenvolvimento inicial* - [GitHub](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- NestJS team pela excelente framework
- MongoDB pela robustez do banco de dados
- AWS pela infraestrutura de autenticação
- Comunidade open source pelo suporte

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!** ⭐