import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { loadEnvFromSSM } from './config/load-env';

async function bootstrap() {
  console.log('🚀 Iniciando aplicação...');
  console.log(`📋 NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`📋 IS_OFFLINE: ${process.env.IS_OFFLINE || 'undefined'}`);
  console.log(`📋 AWS_PROFILE: ${process.env.AWS_PROFILE || 'undefined'}`);
  console.log(`📋 AWS_REGION: ${process.env.AWS_REGION || 'undefined'}`);

  // Carrega as variáveis do SSM apenas se não estiver em desenvolvimento local
  if (!process.env.IS_OFFLINE && process.env.NODE_ENV !== 'development') {
    console.log('🌐 Modo produção: carregando variáveis do SSM...');
    await loadEnvFromSSM();
  } else {
    console.log('🔧 Modo local: usando variáveis de ambiente locais');
    console.log('   (SSM não será carregado em modo local)');
  }

  // Mostrar variáveis relevantes após carregamento
  console.log('\n📊 Variáveis de ambiente após carregamento:');
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'DEFINIDA' : 'UNDEFINIDA'}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'DEFINIDA' : 'UNDEFINIDA'}`);
  console.log(`   PORT: ${process.env.PORT || '3000 (padrão)'}`);
  console.log('');

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Wishlist Backend API')
    .setDescription('API para gerenciamento de listas de desejos e convites')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addSecurityRequirements('bearer')
    .addTag('Auth', 'Endpoints de autenticação e registro')
    .addTag('Users', 'Gerenciamento de usuários e dependentes')
    .addTag('Wishlists', 'Gerenciamento de listas de desejos')
    .addTag('Items', 'Gerenciamento de itens das listas')
    .addTag('Reservations', 'Gerenciamento de reservas')
    .addTag('Conversations', 'Sistema de conversas')
    .addTag('Invitations', 'Sistema de convites')
    .addTag('Public', 'Endpoints públicos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `📚 Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}
bootstrap().catch((err) => {
  console.error('Erro durante a inicialização da aplicação:', err);
  process.exit(1);
});
