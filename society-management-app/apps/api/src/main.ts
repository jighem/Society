import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set API prefix
  app.setGlobalPrefix('api/v1');

  // Input validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS config
  app.enableCors({
    origin: '*', // Define allowed origins in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger integration
  const config = new DocumentBuilder()
    .setTitle('Co-operative Housing Society Management System API')
    .setDescription('Production-ready backend endpoints supporting SaaS multitenancy')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`\n🚀 Society management backend is running on: http://localhost:${port}/api/v1`);
  console.log(`📑 Swagger documentation is accessible at: http://localhost:${port}/docs\n`);
}

bootstrap();

