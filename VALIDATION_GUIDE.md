# 🔧 Guia de Validação - Wishlist Backend

Este guia explica como validar se as configurações do AWS Cognito e Email estão funcionando corretamente.

## 📋 Pré-requisitos

1. **Arquivo .env configurado** com as variáveis necessárias
2. **Credenciais AWS** configuradas (via AWS CLI ou variáveis de ambiente)
3. **Node.js 18+** instalado
4. **Dependências** instaladas (`npm install`)

## 🚀 Como Validar

### 1. Validação Rápida (Recomendado)

Execute o script principal que testa todas as configurações:

```bash
npm run test:config
```

Este comando irá:
- ✅ Verificar todas as variáveis de ambiente
- 🔐 Testar conexão com AWS Cognito
- 📧 Testar configuração de email SMTP
- 🌐 Verificar se a aplicação está rodando

### 2. Validações Individuais

#### Testar apenas AWS Cognito:
```bash
npm run test:cognito
```

#### Testar apenas Email:
```bash
npm run test:email
```

### 3. Validação via API (quando aplicação estiver rodando)

1. Inicie a aplicação:
```bash
npm run start:dev
```

2. Acesse o endpoint de status:
```bash
curl http://localhost:3000/config-status
```

## 📊 Interpretando os Resultados

### ✅ Sucesso
- **Variáveis configuradas**: Todas as variáveis necessárias estão definidas
- **AWS Cognito**: Conexão estabelecida com sucesso
- **Email SMTP**: Conexão SMTP funcionando
- **Aplicação**: Respondendo corretamente

### ⚠️ Avisos
- **Configurações opcionais**: Algumas funcionalidades podem estar desabilitadas
- **Credenciais AWS**: Verifique se estão configuradas corretamente
- **Porta SMTP**: Verifique se a porta está correta (587 para TLS, 465 para SSL)

### ❌ Erros
- **Variáveis faltando**: Configure as variáveis de ambiente necessárias
- **Credenciais inválidas**: Verifique usuário/senha do SMTP
- **Conexão falhou**: Verifique conectividade de rede

## 🔧 Solução de Problemas

### AWS Cognito

**Erro: NotAuthorizedException**
```bash
# Configure as credenciais AWS
aws configure

# Ou configure as variáveis de ambiente
export AWS_ACCESS_KEY_ID=sua_access_key
export AWS_SECRET_ACCESS_KEY=sua_secret_key
export AWS_REGION=us-east-1
```

**Erro: ResourceNotFoundException**
- Verifique se o `COGNITO_USER_POOL_ID` está correto
- Confirme se o User Pool existe na região especificada

### Email SMTP

**Erro: EAUTH (Autenticação)**
- Verifique `SMTP_USER` e `SMTP_PASS`
- Para Gmail, use senha de aplicativo
- Para AWS SES, verifique as credenciais IAM

**Erro: ECONNECTION (Conexão)**
- Verifique `SMTP_HOST` e `SMTP_PORT`
- Teste conectividade: `telnet smtp_host porta`
- Verifique firewall/proxy

**Erro: ETIMEDOUT (Timeout)**
- Tente porta 465 (SSL) em vez de 587 (TLS)
- Verifique se não há bloqueio de firewall

## 📧 Teste de Email Real

Para testar o envio real de emails:

1. Configure no arquivo `.env`:
```env
TEST_EMAIL=seu-email@exemplo.com
SEND_TEST_EMAIL=true
```

2. Execute o teste:
```bash
npm run test:email
```

## 🔍 Monitoramento Contínuo

### Logs da Aplicação
A aplicação registra logs detalhados sobre:
- Configuração do serviço de email
- Erros de conexão SMTP
- Status das validações

### Endpoint de Health Check
```bash
curl http://localhost:3000/health
```

### Endpoint de Status de Configuração
```bash
curl http://localhost:3000/config-status
```

## 📝 Checklist de Validação

- [ ] Arquivo `.env` criado e configurado
- [ ] Variáveis obrigatórias definidas (MONGODB_URI, JWT_SECRET)
- [ ] Variáveis do AWS Cognito configuradas
- [ ] Variáveis de email SMTP configuradas
- [ ] Credenciais AWS configuradas
- [ ] Teste de conexão Cognito passou
- [ ] Teste de conexão SMTP passou
- [ ] Aplicação inicia sem erros
- [ ] Endpoint `/config-status` responde corretamente

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os logs** da aplicação
2. **Execute os scripts de teste** para diagnóstico
3. **Consulte a documentação** do AWS Cognito e SES
4. **Verifique as credenciais** e permissões

## 📚 Recursos Adicionais

- [Documentação AWS Cognito](https://docs.aws.amazon.com/cognito/)
- [Documentação AWS SES](https://docs.aws.amazon.com/ses/)
- [Documentação Nodemailer](https://nodemailer.com/about/)
- [Configuração AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)
