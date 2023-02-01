import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { GameIoAdapter } from './game/game-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  //app.useWebSocketAdapter(new GameIoAdapter(app));
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
