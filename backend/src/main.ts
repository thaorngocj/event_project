import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend clients
  app.enableCors({
    origin: [
      'http://localhost:3001', // client-superadmin
      'http://localhost:3002', // client-customer
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global validation pipe (bắt buộc để class-validator hoạt động)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Quản lý ngày rèn luyện API')
    .setDescription('API cho hệ thống quản lý ngày rèn luyện')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log('Server running on http://localhost:3000');
  console.log('Swagger UI: http://localhost:3000/api/docs');
  console.log('SuperAdmin UI: http://localhost:3001');
  console.log('Customer UI:   http://localhost:3002');
}
void bootstrap();
