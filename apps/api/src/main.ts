import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DEFAULT_API_PORT, API_PREFIX } from '@walikelas/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Cookie Parser for application sessions
  app.use(cookieParser(process.env.SESSION_SECRET || 'wk-dev-secret'));

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3006')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  });

  // Global API Prefix (e.g., /api/v1)
  const apiPrefix = (process.env.API_PREFIX || API_PREFIX).replace(/^\//, '');
  app.setGlobalPrefix(apiPrefix);

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Exception Envelope Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Port Configuration
  const port = Number(process.env.API_PORT) || DEFAULT_API_PORT;
  await app.listen(port);

  logger.log(`API server is running on: http://localhost:${port}/${apiPrefix}`);
}

void bootstrap();
