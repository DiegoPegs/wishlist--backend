// Script de desenvolvimento local que funciona
const { spawn } = require('child_process');

// Definir variáveis de ambiente
process.env.NODE_ENV = 'development';
process.env.DATABASE_URL = 'mongodb://localhost:27017/wishlist-dev';
process.env.JWT_SECRET = 'your-jwt-secret-key-for-development';
process.env.AWS_COGNITO_USER_POOL_ID = 'us-east-1_example';
process.env.AWS_COGNITO_CLIENT_ID = 'example-client-id';
process.env.AWS_REGION = 'us-east-1';
process.env.FRONTEND_URL = 'http://localhost:3001';

console.log('🔧 Iniciando servidor em modo desenvolvimento local...');
console.log('📋 Variáveis de ambiente configuradas:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ Não configurado'}`);

// Executar o servidor usando ts-node diretamente
const server = spawn('npx', ['ts-node', 'src/main.ts'], {
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('close', (code) => {
  console.log(`Servidor finalizado com código: ${code}`);
});

server.on('error', (err) => {
  console.error('Erro ao iniciar servidor:', err);
});