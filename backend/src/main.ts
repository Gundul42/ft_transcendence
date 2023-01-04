import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  // app.enableCors({
  //   origin: "http://localhost:3000",
  //   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // });
  // BAD SECURITY
  const options = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
    allowedHeaders: 'Content-Type, Accept',
  };
  app.enableCors(options);
  await app.listen(8000);
}
bootstrap();
