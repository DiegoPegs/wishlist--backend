import { configure } from '@codegenie/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let cachedServer;

export const handler = async (event, context) => {
  if (!cachedServer) {
    // Para desenvolvimento local, não carregar SSM
    if (!process.env.IS_OFFLINE && process.env.NODE_ENV !== 'development') {
      const { loadEnvFromSSM } = await import('./config/load-env');
      await loadEnvFromSSM();
    } else {
      console.log('🔧 Modo local: usando variáveis de ambiente locais');
    }

    const expressApp = require('express')();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    nestApp.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    nestApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

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

    const document = SwaggerModule.createDocument(nestApp, config);
    SwaggerModule.setup('api', nestApp, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    await nestApp.init();
    cachedServer = configure({ app: expressApp });
  }

  return cachedServer(event, context);
};
