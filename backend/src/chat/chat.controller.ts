import { Controller, Get, UseGuards, Res, Req, UseFilters, Query, Headers } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';
import { Session, AppUser } from '@prisma/client';
import { Server } from "socket.io";

@Controller("api")
export class ChatController {
	constructor(private authService: ChatService, private prisma: PrismaService/*private sessionService: SessionService, private userService: Service*/)
	{
		// io.engine.clientsCount;
	  
	}
}  