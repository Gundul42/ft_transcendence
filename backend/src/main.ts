import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
// import { Server } from 'socket.io';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const microservice = app.connectMicroservice({
  //   // transport: Transport.TCP,
  // });
  app.use(cookieParser());
  // await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
