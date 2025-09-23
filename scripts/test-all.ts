#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import * as path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

async function runAllTests() {
  console.log('🚀 Iniciando testes de configuração do Wishlist Backend\n');
  console.log('=' .repeat(60));

  const scriptsDir = path.join(__dirname);

  try {
    // Teste 1: Validação de variáveis de ambiente
    console.log('\n📋 1. Testando validação de variáveis de ambiente...');
    console.log('-'.repeat(50));

    const requiredVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'AWS_REGION',
      'COGNITO_USER_POOL_ID',
      'COGNITO_CLIENT_ID',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASS'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    const configuredVars = requiredVars.filter(varName => process.env[varName]);

    console.log(`✅ Variáveis configuradas: ${configuredVars.length}/${requiredVars.length}`);

    if (missingVars.length > 0) {
      console.log(`❌ Variáveis faltando: ${missingVars.join(', ')}`);
    } else {
      console.log('✅ Todas as variáveis de ambiente estão configuradas!');
    }

    // Teste 2: AWS Cognito
    console.log('\n🔐 2. Testando AWS Cognito...');
    console.log('-'.repeat(50));

    try {
      execSync(`ts-node ${scriptsDir}/test-cognito.ts`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Teste do AWS Cognito concluído!');
    } catch (error) {
      console.log('❌ Teste do AWS Cognito falhou - verifique as configurações');
    }

    // Teste 3: Email SMTP
    console.log('\n📧 3. Testando configuração de email...');
    console.log('-'.repeat(50));

    try {
      execSync(`ts-node ${scriptsDir}/test-email.ts`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Teste de email concluído!');
    } catch (error) {
      console.log('❌ Teste de email falhou - verifique as configurações SMTP');
    }

    // Teste 4: Aplicação (se estiver rodando)
    console.log('\n🌐 4. Testando aplicação (opcional)...');
    console.log('-'.repeat(50));

    try {
      const response = await fetch('http://localhost:3000/config-status');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Aplicação está rodando e respondendo!');
        console.log(`   Status: ${data.validation.isValid ? '✅ Válido' : '❌ Inválido'}`);
        console.log(`   Warnings: ${data.validation.warnings.length}`);
        console.log(`   Errors: ${data.validation.errors.length}`);
      } else {
        console.log('⚠️ Aplicação não está rodando ou não respondeu corretamente');
      }
    } catch (error) {
      console.log('⚠️ Aplicação não está rodando - execute "npm run start:dev" para testar');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Testes de configuração concluídos!');
    console.log('\n📋 Resumo:');
    console.log(`   • Variáveis de ambiente: ${configuredVars.length}/${requiredVars.length} configuradas`);
    console.log('   • AWS Cognito: Verifique os logs acima');
    console.log('   • Email SMTP: Verifique os logs acima');
    console.log('   • Aplicação: Verifique se está rodando');

    console.log('\n💡 Próximos passos:');
    console.log('   1. Corrija qualquer erro mostrado acima');
    console.log('   2. Execute "npm run start:dev" para iniciar a aplicação');
    console.log('   3. Acesse http://localhost:3000/config-status para ver o status');
    console.log('   4. Teste as funcionalidades de autenticação e email');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
}

// Executar todos os testes
runAllTests().catch(console.error);
