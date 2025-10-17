#!/usr/bin/env ts-node

/**
 * Script para testar o carregamento de variáveis de ambiente do AWS SSM
 *
 * Uso: npm run test:ssm
 */

import { loadEnvFromSSM } from '../src/config/load-env';

async function testSSM() {
  console.log('🧪 Iniciando teste do carregamento de variáveis do SSM...\n');

  // Mostrar configurações atuais
  console.log('📋 Configurações atuais:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`   AWS_PROFILE: ${process.env.AWS_PROFILE || 'undefined'}`);
  console.log(`   AWS_REGION: ${process.env.AWS_REGION || 'undefined'}`);
  console.log(`   IS_OFFLINE: ${process.env.IS_OFFLINE || 'undefined'}`);
  console.log(`   SERVERLESS_OFFLINE: ${process.env.SERVERLESS_OFFLINE || 'undefined'}`);
  console.log('');

  try {
    // Carregar variáveis do SSM
    await loadEnvFromSSM();

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   Total de variáveis em process.env: ${Object.keys(process.env).length}`);

    // Mostrar algumas variáveis de exemplo (sem valores sensíveis)
    const envKeys = Object.keys(process.env).filter(key =>
      key.includes('MONGO') ||
      key.includes('JWT') ||
      key.includes('AWS') ||
      key.includes('EMAIL') ||
      key.includes('COGNITO')
    );

    if (envKeys.length > 0) {
      console.log('\n🔍 Variáveis relevantes encontradas:');
      envKeys.forEach(key => {
        const value = process.env[key];
        const maskedValue = value ? value.substring(0, 4) + '...' : 'undefined';
        console.log(`   ${key}: ${maskedValue}`);
      });
    }

    // Verificação específica do MongoDB
    console.log('\n🔍 Verificação específica do MongoDB:');
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      console.log(`   ✅ MONGODB_URI está definida`);
      console.log(`   📍 Origem: ${mongoUri.includes('localhost') ? 'Local' : 'SSM/Externa'}`);
      console.log(`   🔗 URI: ${mongoUri.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ MONGODB_URI NÃO está definida`);
      console.log(`   ⚠️ Será usado o valor padrão: mongodb://localhost:27017/wishlist-backend`);
    }

  } catch (error) {
    console.error('\n💥 Erro durante o teste:', error);
    process.exit(1);
  }
}

// Executar o teste
testSSM().catch(console.error);
