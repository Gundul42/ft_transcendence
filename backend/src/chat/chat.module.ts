import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RoomsManager } from './rooms/rooms.manager';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ChatGateway, ChatService, RoomsManager]
})
export class ChatModule {}

//   {
//   useFactory: (prisma: PrismaService) => {
//     return new RoomsManager(prisma);
//   },
//   provide: ,
//   inject: [PrismaService]
// }]