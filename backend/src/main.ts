import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
  });

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
}
void bootstrap();
