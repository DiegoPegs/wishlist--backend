import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do Swagger
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

  // Configuração de validação global
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
