import { configure } from '@codegenie/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';

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

    await nestApp.init();
    cachedServer = configure({ app: expressApp });
  }

  return cachedServer(event, context);
};
