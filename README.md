# 🎁 Wishlist Backend

Sistema completo de wishlist com autenticação JWT, gerenciamento de dependentes, sistema de reservas e conversas anônimas.

## 🚀 Funcionalidades

### 🔐 Autenticação e Usuários
- **Registro e Login** com JWT
- **Integração AWS Cognito** para gerenciamento de senhas
- **Recuperação de Senha** com tokens seguros
- **Perfis de Usuário** com informações pessoais
- **Sistema de Seguidores** (follow/unfollow)
- **Perfil de Presentes** personalizável

### 👨‍👩‍👧‍👦 Gerenciamento de Dependentes
- **Criação de Dependentes** por guardiões
- **Sistema de Guardiões** com convites
- **Controle de Permissões** granular
- **Remoção Segura** de guardiões (com validação do último guardião)
- **Desativação e Restauração** de dependentes
- **Exclusão Permanente** com validações de segurança

### 📝 Wishlists e Itens
- **Criação de Wishlists** pessoais e para dependentes
- **Gerenciamento de Itens** com metadados completos
- **Tipos de Itens**: Produtos específicos e genéricos
- **Controle de Quantidade** desejada, reservada e recebida
- **Arquivamento e Restauração** de wishlists
- **Exclusão Permanente** com validações
- **Links Públicos** para compartilhamento

### 🛒 Sistema de Reservas Avançado
- **Reserva de Itens** com validação de quantidade
- **Operações Atômicas** para consistência de dados
- **Ciclo de Vida Completo** das reservas:
  - `RESERVED` → `PURCHASED` → `RECEIVED`
  - `CANCELED` (a qualquer momento)
- **Controle de Contadores** automático:
  - `quantity.desired` (quantidade desejada)
  - `quantity.reserved` (quantidade reservada)
  - `quantity.received` (quantidade recebida)
- **Atualização de Quantidade** de reservas
- **Confirmação de Compra** pelos usuários
- **Marcação como Recebido** pelos donos dos itens
- **Histórico de Reservas** por usuário

### 💬 Sistema de Conversas Anônimas
- **Conversas sobre Itens** específicos
- **Mensagens Anônimas** entre usuários
- **Timestamps** automáticos
- **Controle de Participantes**
- **Privacidade** garantida

### 📧 Sistema de Convites
- **Convites para Guardiões** via email
- **Tokens de Convite** com expiração
- **Aceitação de Convites** com validação
- **Sistema de Permissões** baseado em convites

### 🌐 Funcionalidades Públicas
- **Wishlists Públicas** com tokens de acesso
- **Visualização Anônima** de listas compartilhadas
- **Links Seguros** para compartilhamento

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

### 🔗 Endpoints Principais

#### 🔐 Autenticação (`/auth`)
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login
- `POST /auth/change-password` - Alterar senha
- `POST /auth/forgot-password` - Solicitar recuperação de senha
- `POST /auth/reset-password` - Redefinir senha

#### 👤 Usuários (`/users`)
- `GET /users/me` - Obter dados do usuário atual
- `PUT /users/me/gifting-profile` - Atualizar perfil de presentes
- `GET /users/:username` - Obter usuário por username
- `GET /users/me/dependents` - Listar dependentes
- `POST /users/me/dependents` - Criar dependente
- `POST /users/dependents/:id/add-guardian` - Adicionar guardião
- `DELETE /users/dependents/:id` - Desativar dependente
- `POST /users/dependents/:id/restore` - Restaurar dependente
- `DELETE /users/dependents/:id/permanent` - Excluir permanentemente
- `POST /users/:username/follow` - Seguir usuário
- `DELETE /users/:username/follow` - Deixar de seguir
- `GET /users/:username/followers` - Listar seguidores
- `GET /users/:username/following` - Listar seguindo

#### 📝 Wishlists (`/wishlists`)
- `POST /wishlists` - Criar wishlist
- `GET /wishlists/mine` - Listar minhas wishlists
- `GET /wishlists/:id` - Obter wishlist com itens
- `DELETE /wishlists/:id` - Arquivar wishlist
- `POST /wishlists/:id/restore` - Restaurar wishlist
- `DELETE /wishlists/:id/permanent` - Excluir permanentemente
- `POST /wishlists/:id/items` - Adicionar item

#### 🛍️ Itens (`/items`)
- `PUT /items/:id` - Atualizar metadados do item
- `PATCH /items/:id/quantity` - Alterar quantidade desejada
- `POST /items/:id/mark-as-received` - Marcar como recebido
- `DELETE /items/:id` - Excluir item

#### 🛒 Reservas (`/reservations`)
- `POST /reservations` - Criar reserva
- `GET /reservations/mine` - Listar minhas reservas
- `GET /reservations/:id` - Obter reserva específica
- `PATCH /reservations/:id` - Atualizar quantidade da reserva
- `POST /reservations/:id/confirm-purchase` - Confirmar compra
- `DELETE /reservations/:id` - Cancelar reserva

#### 💬 Conversas (`/conversations`)
- `POST /conversations/items/:itemId/start` - Iniciar conversa sobre item
- `GET /conversations/:id/messages` - Obter mensagens da conversa
- `POST /conversations/:id/messages` - Enviar mensagem

#### 📧 Convites (`/invitations`)
- `POST /invitations/accept` - Aceitar convite de guardião

#### 🌐 Público (`/public`)
- `GET /public/wishlists/:token` - Obter wishlist pública

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
- **Validação de ObjectId**: Prevenção de erros de cast
- **Controle de Permissões**: Validação granular de acesso

## ✨ Melhorias Implementadas

### 🛠️ Documentação Swagger
- **100% dos endpoints** documentados com Swagger/OpenAPI
- **Documentação completa** com exemplos e códigos de status
- **Validação de parâmetros** com `@ApiParam`
- **Respostas padronizadas** com `@ApiResponse`
- **Organização por tags** funcionais

### 🔧 Correções de Roteamento
- **Ordem de rotas** corrigida para evitar conflitos
- **Rotas específicas** (`/mine`, `/me`) antes de genéricas (`/:id`)
- **Validação de ObjectId** em todos os endpoints que usam IDs
- **Mensagens de erro** claras e descritivas

### ⚡ Operações Atômicas
- **Contadores de quantidade** gerenciados atomicamente
- **Operações `$inc`** para incremento/decremento seguro
- **Consistência de dados** garantida em operações críticas
- **Prevenção de race conditions** em reservas

### 🎯 Casos de Uso Refinados
- **ConfirmPurchaseUseCase**: Apenas altera status (não modifica Item)
- **CancelReservationUseCase**: Altera status + decrementa reserved
- **MarkAsReceivedUseCase**: Altera status + incrementa received + decrementa reserved
- **Ciclo de vida** das reservas bem definido e consistente

## 🔄 Fluxo de Reservas

### 1. **Criação de Reserva**
```
Usuário → POST /reservations → Item.quantity.reserved++
Status: RESERVED
```

### 2. **Confirmação de Compra**
```
Usuário → POST /reservations/:id/confirm-purchase
Status: RESERVED → PURCHASED
Item: Não alterado
```

### 3. **Marcação como Recebido**
```
Dono do Item → POST /items/:id/mark-as-received
Status: PURCHASED → RECEIVED
Item: quantity.received++, quantity.reserved--
```

### 4. **Cancelamento**
```
Usuário → DELETE /reservations/:id
Status: RESERVED → CANCELED
Item: quantity.reserved--
```

### 5. **Atualização de Quantidade**
```
Usuário → PATCH /reservations/:id
Ajusta quantity.reserved no Item
Status: Mantém RESERVED
```

## 📊 Status Codes e Validações

### 🔢 Códigos de Status HTTP
- **200 OK**: Operação realizada com sucesso
- **201 Created**: Recurso criado com sucesso
- **204 No Content**: Operação realizada sem retorno
- **400 Bad Request**: Dados inválidos ou regra de negócio violada
- **401 Unauthorized**: Token JWT inválido ou expirado
- **403 Forbidden**: Usuário não tem permissão para a operação
- **404 Not Found**: Recurso não encontrado
- **500 Internal Server Error**: Erro interno do servidor

### ✅ Validações Implementadas
- **ObjectId**: Validação de formato para IDs do MongoDB
- **Quantidade**: Validação de limites e disponibilidade
- **Permissões**: Verificação de propriedade e acesso
- **Status**: Validação de transições de estado
- **Dados**: Validação de tipos e formatos com class-validator

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

- **NestJS team** pela excelente framework e arquitetura
- **MongoDB** pela robustez do banco de dados e operações atômicas
- **AWS** pela infraestrutura de autenticação
- **Swagger/OpenAPI** pela documentação automática
- **class-validator** pela validação robusta de dados
- **Comunidade open source** pelo suporte e contribuições

## 🎯 Próximos Passos

- [ ] Implementar notificações em tempo real
- [ ] Adicionar sistema de favoritos
- [ ] Implementar busca avançada
- [ ] Adicionar métricas e analytics
- [ ] Implementar cache Redis
- [ ] Adicionar testes de integração

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!** ⭐

🚀 **Sistema completo e funcional com documentação Swagger 100% atualizada!**