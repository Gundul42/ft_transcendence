import { Controller, Get, UseGuards, Res, Req, UseFilters, Query, Headers } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';


@Controller("api")
export class ChatController {
	constructor(private authService: ChatService, private prisma: PrismaService/*private sessionService: SessionService, private userService: Service*/) {}
}  