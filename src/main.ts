import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { json } from 'body-parser';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Middleware to keep raw body for webhooks
function rawBodySaver(req, res, buf, encoding) {
  if (buf && buf.length) {
    (req as any).rawBody = buf.toString(encoding || 'utf8');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security & CORS
  app.use(helmet());
  app.enableCors();

  // Body parsers with raw body for webhooks
  app.use(json({ verify: rawBodySaver }));
  app.use(express.urlencoded({ extended: true }));

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wallet Service API')
    .setDescription('API documentation for Wallet Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Config and start server
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') || 3000;

  
  await app.listen(port, '0.0.0.0');

  console.log(`App running on http://localhost:${port}`);
  console.log(`Swagger available at http://localhost:${port}/api`);
}

bootstrap();
