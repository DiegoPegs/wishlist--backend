#!/usr/bin/env ts-node

import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testEmailConnection() {
  console.log('📧 Testando configuração de email...\n');

  // Verificar variáveis de ambiente
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
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
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`   SMTP_PASS: ${'*'.repeat(process.env.SMTP_PASS?.length || 0)}\n`);

  try {
    // Configurar transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('🔗 Testando conexão SMTP...');

    // Verificar conexão
    await transporter.verify();
    console.log('✅ Conexão SMTP estabelecida com sucesso!');

    // Testar envio de email (opcional - descomente para testar envio real)
    const testEmail = process.env.TEST_EMAIL || process.env.SMTP_USER;

    if (testEmail && process.env.SEND_TEST_EMAIL === 'true') {
      console.log(`\n📤 Enviando email de teste para ${testEmail}...`);

      const mailOptions = {
        from: `"Wishlist Test" <${process.env.SMTP_USER}>`,
        to: testEmail,
        subject: 'Teste de Configuração - Wishlist',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">✅ Configuração de Email Funcionando!</h2>
            <p>Este é um email de teste para verificar se a configuração SMTP está funcionando corretamente.</p>
            <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p><strong>Servidor SMTP:</strong> ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Se você recebeu este email, a configuração está funcionando perfeitamente! 🎉
            </p>
          </div>
        `,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email de teste enviado com sucesso!`);
      console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.log('\n💡 Para testar o envio de email real:');
      console.log('   1. Configure TEST_EMAIL=seu-email@exemplo.com');
      console.log('   2. Configure SEND_TEST_EMAIL=true');
      console.log('   3. Execute o script novamente');
    }

    console.log('\n🎉 Teste de email concluído com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Teste as funcionalidades de convite na aplicação');
    console.log('   2. Teste a funcionalidade de redefinição de senha');
    console.log('   3. Verifique os logs da aplicação para confirmar envios');

  } catch (error: any) {
    console.error('❌ Erro na configuração de email:');
    console.error(`   Código: ${error.code || 'Unknown'}`);
    console.error(`   Mensagem: ${error.message}`);

    if (error.code === 'EAUTH') {
      console.log('\n💡 Possíveis soluções:');
      console.log('   1. Verifique se SMTP_USER e SMTP_PASS estão corretos');
      console.log('   2. Para Gmail, use senha de aplicativo');
      console.log('   3. Para AWS SES, verifique as credenciais IAM');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Possíveis soluções:');
      console.log('   1. Verifique se SMTP_HOST e SMTP_PORT estão corretos');
      console.log('   2. Verifique sua conexão com a internet');
      console.log('   3. Verifique se o servidor SMTP está acessível');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Possíveis soluções:');
      console.log('   1. Verifique se não há firewall bloqueando a conexão');
      console.log('   2. Tente uma porta diferente (465 para SSL, 587 para TLS)');
    }

    process.exit(1);
  }
}

// Executar teste
testEmailConnection().catch(console.error);
