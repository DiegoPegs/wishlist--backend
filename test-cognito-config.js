const { CognitoIdentityProviderClient, InitiateAuthCommand, AuthFlowType } = require('@aws-sdk/client-cognito-identity-provider');
const crypto = require('crypto');

// Configurações do ambiente
const config = {
  region: 'us-east-1',
  userPoolId: 'us-east-1_1mm5i16iy',
  clientId: '236qkaf31di79njo963kj6oguk',
  clientSecret: '1qq9jmugkpe2pvpdsk565ct6q603p6nte2osikfurjoocm29010g'
};

const cognitoClient = new CognitoIdentityProviderClient({
  region: config.region,
});

function calculateSecretHash(username) {
  return crypto
    .createHmac('SHA256', config.clientSecret)
    .update(username + config.clientId)
    .digest('base64');
}

async function testCognitoConfig() {
  try {
    console.log('🔍 Testando configuração do Cognito...');
    console.log('Username: test@example.com');
    console.log('Client ID:', config.clientId);
    console.log('Region:', config.region);

    const secretHash = calculateSecretHash('test@example.com');
    console.log('Secret Hash calculado:', secretHash);

    const command = new InitiateAuthCommand({
      ClientId: config.clientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: 'test@example.com',
        PASSWORD: 'admin123',
        SECRET_HASH: secretHash,
      },
    });

    console.log('📤 Enviando comando USER_PASSWORD_AUTH para Cognito...');
    const response = await cognitoClient.send(command);

    console.log('✅ SUCESSO! USER_PASSWORD_AUTH está funcionando!');
    console.log('Response:', JSON.stringify(response, null, 2));

    return response;
  } catch (error) {
    console.error('❌ Erro no teste:');
    console.error('Nome do erro:', error.name);
    console.error('Mensagem:', error.message);
    console.error('Código:', error.$metadata?.httpStatusCode);

    if (error.name === 'InvalidParameterException' &&
        error.message.includes('USER_PASSWORD_AUTH flow not enabled')) {
      console.log('\n🔧 AÇÃO NECESSÁRIA:');
      console.log('1. Acesse o AWS Cognito Console');
      console.log('2. Vá para User Pools → us-east-1_1mm5i16iy');
      console.log('3. App integration → App clients → 236qkaf31di79njo963kj6oguk');
      console.log('4. Authentication flows → Marque ALLOW_USER_PASSWORD_AUTH');
      console.log('5. Salve as alterações');
    }

    if (error.name === 'UnrecognizedClientException') {
      console.log('\n🔧 AÇÃO NECESSÁRIA:');
      console.log('1. Acesse o IAM Console');
      console.log('2. Crie a política CognitoWishlistBackendPolicy');
      console.log('3. Anexe a política ao usuário AWS');
    }

    throw error;
  }
}

testCognitoConfig().catch(console.error);
