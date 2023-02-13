import { Controller, Get, Post, UseGuards, Query, Req, Body, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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

	@Get('get-accessible-rooms')
	@UseGuards(AuthGuard)
	async getAccessibleRooms(@Req() req: Request, @Query('start') start: string) : Promise<Omit<Room, "password">[]> {
		const session_user: Session & { user: AppUser } = await this.chatService.getSessionUser(req.cookies["ft_transcendence_sessionId"]);
		if (session_user === null) {
			throw new InternalServerErrorException();
		}
		return await this.chatService.getRecordsAccessibleRooms(session_user.user.id, start);
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
				if (aRoom.owner.id === user_rooms.user.id)
					return (this.roomMg.changePassword(aRoom, password));
		})
		console.log("No matching room found/They aren't an owner");
	  }

	@Post('password-remove')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async removePasswordValidation(@Body('room') room: string, @Req() req: Request): Promise<void> {
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		user_rooms.user.rooms.map((aRoom) =>
		{
			if (aRoom.name === room)
			{ 
				if (aRoom.owner.id === user_rooms.user.id)
					return (this.roomMg.removePassword(aRoom));
			}
		})
		console.log("No matching room found/They aren't an owner");
	}

	@Post('admin-promotion')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async promoteToAdminValidation(@Body('room') room: string, @Body('user') userId: string, @Req() req: Request): Promise<void>
	{
		console.log(userId);
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		user_rooms.user.rooms.map((aRoom) =>
		{
			if (aRoom.name === room)
			{
				aRoom.participants.map(user =>
				{
					if (user.id == Number(userId))
					{
						console.log("user match: ", user.id)
						if (aRoom.owner.id === user_rooms.user.id)
							return (this.roomMg.promoteToAdmin(aRoom, user));
					}
				})
			}
		})
		console.log("No matching room found/They aren't an owner");
	}

	@Post('user-kick')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async userKickValidation(@Body('room') room: string, @Body('user') userId: string, @Req() req: Request): Promise<void | string>
	{
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		const valRoom : IRoom | null = this.chatService.validateForOperation(user_rooms.user.rooms, user_rooms.user, Number(userId), room);
		if (valRoom === null)
			return ("You can't perform this action");
		const newvalRoom = await this.roomMg.kickUser(Number(userId), valRoom);
		this.roomMg.server.to(valRoom.name).emit("roomUpdate", { room: newvalRoom });
		return "You kicked that user out";
	}

	@Post('user-ban')
	@UseGuards(AuthGuard)
	async userBanValidation(@Body('room') room: string, @Body('user') userId: string, @Body('time') time: string, @Req() req: Request): Promise<void | string>
	{
		const timeNum = Number(time);
		if (timeNum === 0 || Number.isNaN(timeNum))
			return ("Put proper time!");
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		const valRoom : IRoom | null = this.chatService.validateForOperation(user_rooms.user.rooms, user_rooms.user, Number(userId), room);
		if (valRoom === null)
			return ("You can't perform this action");
		this.roomMg.banUser(Number(userId), valRoom, timeNum);
		return ("You banned that user for " + timeNum + " minutes!");
	}
	
	@Post('user-mute')
	@UseGuards(AuthGuard)
	async userMuteValidation(@Body('room') room: string, @Body('user') userId: string, @Body('time') time: string, @Req() req: Request): Promise<void | string>
	{
		const timeNum = Number(time);
		if (timeNum === 0 || Number.isNaN(timeNum))
			return ("Put proper time!");
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		const valRoom : IRoom | null = this.chatService.validateForOperation(user_rooms.user.rooms, user_rooms.user, Number(userId), room);
		if (valRoom === null)
			return ("You can't perform this action");
		this.roomMg.muteUser(Number(userId), valRoom, timeNum);
		return ("You muted that user for " + timeNum + " minutes!");
	}

	@Post('create-room')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async createRoom(@Body('access_mode') access_mode: number, @Body('password') password: string, @Body('name') room_name: string, @Req() req: Request): Promise<void> {
		const access: number = Number(access_mode);
		const session_user: Session & { user: AppUser } = await this.chatService.getSessionUser(req.cookies["ft_transcendence_sessionId"]);
		if (session_user === null) {
			throw new InternalServerErrorException();
		} else if (access < 0 || access > 2 || (access === 2 && password.length < 5) || room_name.length < 1 || await this.chatService.createNewRoom(session_user.user.id, room_name, password, access) === false) {
			throw new BadRequestException();
		}
	}
}
