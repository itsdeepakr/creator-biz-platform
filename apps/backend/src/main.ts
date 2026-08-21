import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import express from 'express';
import { AppModule } from './app.module';
import { PrismaService } from './common/services/prisma.service';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security
  app.use(helmet({ contentSecurityPolicy: false }));

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 300,
      message: { statusCode: 429, message: 'Too many requests, please try again later.' },
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URLS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'x-razorpay-signature'],
  });

  // Raw body parser for webhooks if needed
  app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

  // Global pipes, filters & interceptors
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  // Root health route
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend running on http://localhost:${port}/api/v1`);
  console.log(`📋 Health: http://localhost:${port}/health`);

  // Graceful shutdown
  const prisma = app.get(PrismaService);
  process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

bootstrap();
