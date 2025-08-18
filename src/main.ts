import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  const allowedOrigins = [
    // Development origins
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:4200',  // Angular default
    'http://localhost:5173',  // Vite default
    'http://localhost:8080',  // Vue CLI default
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    // Production origins
    'https://labpro-ohl-2025-fe.hmif.dev',  // Labpro frontend
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    // Add more production URLs as needed
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
  ];

  app.enableCors({
    origin: isDevelopment ? true : allowedOrigins, // Allow all in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With', 
      'Content-Type',
      'Accept',
      'Authorization',
      'X-HTTP-Method-Override',
      'Cache-Control',
      'Pragma',
    ],
    credentials: true, // Allow cookies/auth headers
    maxAge: 86400, // Cache preflight for 24 hours
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.setGlobalPrefix('api', {
    exclude: [
      '/',
      '/hello',
      '/health',
    ],
  });
  
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));  
  app.setViewEngine('ejs');

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle('Grocademy API')
    .setDescription('Grocademy API documentation')
    .setVersion('1.0')
    .addTag('grocademy')
    .addBearerAuth() // Add JWT Bearer auth to Swagger
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Move to /api/docs

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();