#!/usr/bin/env ts-node

/**
 * Script para testar a conectividade com AWS e verificar configurações
 *
 * Uso: npm run test:aws
 */

import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

async function testAWSConnection() {
  console.log('🔍 Testando conectividade com AWS...\n');

  // Mostrar configurações atuais
  console.log('📋 Configurações AWS:');
  console.log(`   AWS_PROFILE: ${process.env.AWS_PROFILE || 'undefined'}`);
  console.log(`   AWS_REGION: ${process.env.AWS_REGION || 'undefined'}`);
  console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? 'DEFINIDA' : 'UNDEFINIDA'}`);
  console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? 'DEFINIDA' : 'UNDEFINIDA'}`);
  console.log(`   AWS_SESSION_TOKEN: ${process.env.AWS_SESSION_TOKEN ? 'DEFINIDA' : 'UNDEFINIDA'}`);
  console.log('');

  try {
    // Teste 1: Verificar identidade do usuário
    console.log('🔐 Teste 1: Verificando identidade do usuário...');
    const stsClient = new STSClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    const identityCommand = new GetCallerIdentityCommand({});
    const identity = await stsClient.send(identityCommand);

    console.log('✅ Conectividade AWS OK!');
    console.log(`   Account ID: ${identity.Account}`);
    console.log(`   User ID: ${identity.UserId}`);
    console.log(`   ARN: ${identity.Arn}`);
    console.log('');

    // Teste 2: Verificar SSM
    console.log('🔧 Teste 2: Testando acesso ao SSM...');
    const region = process.env.AWS_REGION || 'us-east-1';
    const ssmClient = new SSMClient({
      region: region,
    });

    console.log(`   Região: ${region}`);

    // Testar diferentes caminhos do SSM
    const testPaths = [
      '/app/kero-wishlist/production/',
      '/app/kero-wishlist/development/',
      '/kero-wishlist/production/',
      '/kero-wishlist/development/',
    ];

    for (const path of testPaths) {
      try {
        console.log(`   Testando caminho: ${path}`);
        const command = new GetParametersByPathCommand({
          Path: path,
          Recursive: true,
          WithDecryption: true,
        });

        const response = await ssmClient.send(command);
        const parameters = response.Parameters || [];

        console.log(`   ✅ Caminho ${path}: ${parameters.length} parâmetros encontrados`);

        if (parameters.length > 0) {
          console.log(`   📋 Parâmetros encontrados:`);
          parameters.forEach((param, index) => {
            const key = param.Name?.replace(path, '') || 'unknown';
            console.log(`      ${index + 1}. ${key}`);
          });
        }
        console.log('');
      } catch (error) {
        console.log(`   ❌ Caminho ${path}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro na conectividade AWS:');
    console.error('🔍 Detalhes do erro:', error);

    if (error instanceof Error) {
      console.error('📝 Mensagem de erro:', error.message);

      // Sugestões baseadas no tipo de erro
      if (error.message.includes('credentials')) {
        console.error('\n💡 Possíveis soluções para erro de credenciais:');
        console.error('   1. Verifique se o perfil AWS está configurado corretamente');
        console.error('   2. Execute: aws configure list --profile kero-wishlist');
        console.error('   3. Execute: aws sts get-caller-identity --profile kero-wishlist');
      } else if (error.message.includes('region')) {
        console.error('\n💡 Possíveis soluções para erro de região:');
        console.error('   1. Defina a variável AWS_REGION');
        console.error('   2. Configure a região no arquivo ~/.aws/config');
      } else if (error.message.includes('permission')) {
        console.error('\n💡 Possíveis soluções para erro de permissão:');
        console.error('   1. Verifique se o usuário tem permissões para SSM');
        console.error('   2. Verifique se o usuário tem permissões para a região específica');
      }
    }

    process.exit(1);
  }
}

// Executar o teste
testAWSConnection().catch(console.error);

