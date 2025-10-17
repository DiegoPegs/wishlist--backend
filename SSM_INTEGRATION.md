# AWS SSM Parameter Store Integration

Este projeto foi configurado para usar o AWS Systems Manager (SSM) Parameter Store para gerenciar variáveis de ambiente de forma segura e centralizada.

## 🏗️ Arquitetura

A integração funciona da seguinte forma:

1. **SsmEnvService**: Serviço que se conecta ao SSM e carrega parâmetros
2. **SsmConfigModule**: Módulo NestJS que integra o SSM com o ConfigModule
3. **Carregamento Automático**: As variáveis são carregadas na inicialização da aplicação

## 📁 Estrutura de Arquivos

```
src/
├── infrastructure/
│   ├── config/
│   │   └── ssm-config.module.ts    # Módulo de configuração SSM
│   └── services/
│       └── ssm-env.service.ts      # Serviço para carregar variáveis do SSM
scripts/
└── test-ssm.ts                     # Script de teste da integração
```

## 🔧 Configuração

### 1. Estrutura no SSM Parameter Store

Os parâmetros devem seguir esta estrutura hierárquica:

```
/app/kero-wishlist/
├── development/
│   ├── DATABASE_URL
│   ├── JWT_SECRET
│   ├── AWS_COGNITO_USER_POOL_ID
│   └── AWS_COGNITO_CLIENT_ID
└── production/
    ├── DATABASE_URL
    ├── JWT_SECRET
    ├── AWS_COGNITO_USER_POOL_ID
    └── AWS_COGNITO_CLIENT_ID
```

### 2. Variáveis de Ambiente Locais

Configure estas variáveis localmente:

```bash
# Ambiente (development/production)
NODE_ENV=development

# Região AWS
AWS_REGION=us-east-1

# Credenciais AWS (ou use AWS CLI: aws configure)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 3. Permissões IAM

Sua conta AWS precisa das seguintes permissões:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParametersByPath",
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/app/kero-wishlist/*"
    }
  ]
}
```

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Credenciais AWS

```bash
# Opção 1: AWS CLI
aws configure

# Opção 2: Variáveis de ambiente
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

### 3. Testar Integração

```bash
npm run test:ssm
```

### 4. Executar Aplicação

```bash
npm run start:dev
```

## 🧪 Testando

### Script de Teste SSM

```bash
npm run test:ssm
```

Este script irá:
- Conectar ao SSM Parameter Store
- Carregar variáveis do ambiente atual
- Aplicar as variáveis ao processo
- Mostrar quais variáveis foram encontradas (com valores mascarados)

### Logs de Debug

Para ver logs detalhados da integração SSM, configure:

```bash
export LOG_LEVEL=debug
```

## 🔒 Segurança

### Parâmetros Seguros

Use **SecureString** para parâmetros sensíveis no SSM:

```bash
aws ssm put-parameter \
  --name "/app/kero-wishlist/development/JWT_SECRET" \
  --value "your-secret-value" \
  --type "SecureString" \
  --description "JWT Secret for development"
```

### Prioridade de Variáveis

A ordem de prioridade é:

1. **Variáveis locais** (`.env`, `process.env`)
2. **SSM Parameter Store** (sobrescreve apenas se local não existir)
3. **Valores padrão** (definidos no código)

## 🐛 Troubleshooting

### Problema: "Nenhuma variável encontrada no SSM"

**Soluções:**
1. Verifique se os parâmetros existem no caminho correto
2. Confirme as credenciais AWS
3. Verifique as permissões IAM
4. Teste com: `npm run test:ssm`

### Problema: "Falha ao carregar variáveis do SSM"

**Soluções:**
1. Verifique a conectividade com AWS
2. Confirme a região AWS
3. Verifique se os parâmetros não estão criptografados incorretamente

### Problema: "Aplicação não inicia"

**Soluções:**
1. Em desenvolvimento: aplicação continua mesmo sem SSM
2. Em produção: falha se não conseguir carregar do SSM
3. Verifique logs para detalhes específicos

## 📚 Referências

- [AWS SSM Parameter Store Documentation](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [AWS SDK v3 for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
