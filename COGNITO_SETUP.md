# Configuração do AWS Cognito

## Problema Atual
O sistema está usando um fallback de autenticação local porque o AWS Cognito não está configurado corretamente.

## Soluções

### Opção 1: Configurar Cognito (Recomendado para Produção)

#### 1. Habilitar USER_PASSWORD_AUTH
1. Acesse [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. User Pools → `us-east-1_1mm5i16iy`
3. App integration → App clients → `236qkaf31di79njo963kj6oguk`
4. Authentication flows → Marcar:
   - ✅ ALLOW_USER_PASSWORD_AUTH
   - ✅ ALLOW_REFRESH_TOKEN_AUTH

#### 2. Configurar Permissões IAM
Criar política IAM com permissões:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:AdminInitiateAuth",
                "cognito-idp:InitiateAuth",
                "cognito-idp:SignUp",
                "cognito-idp:ConfirmSignUp",
                "cognito-idp:AdminGetUser",
                "cognito-idp:AdminCreateUser",
                "cognito-idp:AdminSetUserPassword",
                "cognito-idp:AdminDeleteUser",
                "cognito-idp:ChangePassword",
                "cognito-idp:ForgotPassword",
                "cognito-idp:ConfirmForgotPassword"
            ],
            "Resource": "arn:aws:cognito-idp:us-east-1:*:userpool/us-east-1_1mm5i16iy"
        }
    ]
}
```

#### 3. Configurar Credenciais AWS
```env
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
```

### Opção 2: Usar Apenas Autenticação Local

Se preferir não usar Cognito, posso modificar o sistema para:
- Hash de senhas com bcrypt
- Autenticação local completa
- Sem dependência do AWS

## Status Atual
✅ Sistema funcionando com fallback local
✅ Login funcionando com senha "admin123"
✅ Tokens JWT sendo gerados corretamente

## Próximos Passos
1. Escolher entre configurar Cognito ou usar autenticação local
2. Se escolher Cognito, seguir os passos da Opção 1
3. Se escolher local, solicitar modificação do sistema
