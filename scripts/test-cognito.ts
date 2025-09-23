#!/usr/bin/env ts-node

import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testCognitoConnection() {
  console.log('🔍 Testando conexão com AWS Cognito...\n');

  // Verificar variáveis de ambiente
  const requiredVars = ['AWS_REGION', 'COGNITO_USER_POOL_ID', 'COGNITO_CLIENT_ID'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente faltando:', missingVars.join(', '));
    console.log('\n📝 Configure as seguintes variáveis no seu arquivo .env:');
    missingVars.forEach(varName => {
      console.log(`   ${varName}=seu_valor_aqui`);
    });
    process.exit(1);
  }

  console.log('✅ Variáveis de ambiente configuradas');
  console.log(`   AWS_REGION: ${process.env.AWS_REGION}`);
  console.log(`   COGNITO_USER_POOL_ID: ${process.env.COGNITO_USER_POOL_ID}`);
  console.log(`   COGNITO_CLIENT_ID: ${process.env.COGNITO_CLIENT_ID}\n`);

  try {
    // Criar cliente Cognito
    const cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION,
    });

    console.log('🔗 Testando conexão com AWS Cognito...');

    // Tentar listar usuários (operação básica para testar conectividade)
    const command = new ListUsersCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Limit: 1, // Apenas 1 usuário para teste
    });

    const response = await cognitoClient.send(command);

    console.log('✅ Conexão com AWS Cognito estabelecida com sucesso!');
    console.log(`   Total de usuários no pool: ${response.PaginationToken ? 'Mais de 1' : response.Users?.length || 0}`);

    if (response.Users && response.Users.length > 0) {
      const user = response.Users[0];
      console.log(`   Exemplo de usuário: ${user.Username} (${user.UserStatus})`);
    }

    console.log('\n🎉 Teste do AWS Cognito concluído com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Verifique se as credenciais AWS estão configuradas (AWS CLI ou variáveis de ambiente)');
    console.log('   2. Teste as funcionalidades de autenticação na aplicação');
    console.log('   3. Configure usuários de teste no console do AWS Cognito se necessário');

  } catch (error: any) {
    console.error('❌ Erro ao conectar com AWS Cognito:');
    console.error(`   Código: ${error.name || 'Unknown'}`);
    console.error(`   Mensagem: ${error.message}`);

    if (error.name === 'NotAuthorizedException') {
      console.log('\n💡 Possíveis soluções:');
      console.log('   1. Verifique se as credenciais AWS estão configuradas corretamente');
      console.log('   2. Execute: aws configure');
      console.log('   3. Ou configure as variáveis AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY');
    } else if (error.name === 'ResourceNotFoundException') {
      console.log('\n💡 Possíveis soluções:');
      console.log('   1. Verifique se o COGNITO_USER_POOL_ID está correto');
      console.log('   2. Verifique se o User Pool existe na região especificada');
    } else if (error.name === 'InvalidParameterException') {
      console.log('\n💡 Possíveis soluções:');
      console.log('   1. Verifique se o COGNITO_CLIENT_ID está correto');
      console.log('   2. Verifique se o Client ID pertence ao User Pool especificado');
    }

    process.exit(1);
  }
}

// Executar teste
testCognitoConnection().catch(console.error);
