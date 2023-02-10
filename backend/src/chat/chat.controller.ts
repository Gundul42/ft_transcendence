import { Controller, Get, Post, UseGuards, Res, Req, Body, Param, UseFilters, Query, Headers, InternalServerErrorException } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';
import { Session, AppUser, Room } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { IRoom } from '../Interfaces';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoomsManager } from './rooms/rooms.manager';
@Controller("chat")
export class ChatController {
	constructor(
		private chatService: ChatService,
		private prisma: PrismaService,
		private readonly roomMg: RoomsManager)
		{
			roomMg.prisma = prisma;
		}
	
	@Get('retrieve')
	@UseGuards(AuthGuard)
	async retrieveRooms(@Req() req: Request) : Promise<IRoom[]> {
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		if (user_rooms === null) {
			throw new InternalServerErrorException();
		}
		return (user_rooms.user.rooms);
	}

	@Post('password-change')
	@UseGuards(AuthGuard)
	async changePasswordValidation(@Body('room') room: string, @Body('password') password: string, @Req() req: Request): Promise<void> {
		if (!password || password.length === 0) {
		  console.log("You need to select a non empty password");
		  return ;
		}
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		user_rooms.user.rooms.map((aRoom) =>
		{
			if (aRoom.name === room)
					return (this.roomMg.changePassword(aRoom, password));
		})
		console.log("No matching room found");
	  }
}