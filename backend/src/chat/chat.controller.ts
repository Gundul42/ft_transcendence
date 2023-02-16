import { Controller, Get, Post, UseGuards, Query, Req, Body, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';
import { Session, AppUser, Room } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { IRoom, IRoomAccess } from '../Interfaces';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoomsManager } from './rooms/rooms.manager';

@Controller("chat")
export class ChatController {
	constructor(
		private chatService: ChatService,
		private prisma: PrismaService,
		private readonly roomMg: RoomsManager) {
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
			throw new BadRequestException();
		}
		if (password.length < 5)
			throw new BadRequestException("Password has to be at least 5 characters long");
		if (password.length > 128)
			throw new BadRequestException("Password has to be at most 128 characters long");
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		if (user_rooms === null) {
			throw new InternalServerErrorException();
		}
		user_rooms.user.rooms.map((aRoom) =>
		{
			if (aRoom.name === room)
			{
				if (aRoom.accessibility === IRoomAccess.DirectMessage)
					return ;
				if (aRoom.owner.id === user_rooms.user.id)
					return (this.roomMg.changePassword(aRoom, password));
			}
		})
	}

	@Post('password-remove')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async removePasswordValidation(@Body('room') room: string, @Req() req: Request): Promise<void> {
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		if (user_rooms === null) {
			throw new InternalServerErrorException();
		}
		user_rooms.user.rooms.map((aRoom) =>
		{
			if (aRoom.name === room)
			{
				if (aRoom.accessibility === IRoomAccess.DirectMessage)
					return ;
				if (aRoom.owner.id === user_rooms.user.id)
					return (this.roomMg.removePassword(aRoom));
			}
		})
	}

	@Post('admin-promotion')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async promoteToAdminValidation(@Body('room') room: string, @Body('user') userId: string, @Req() req: Request): Promise<void> {
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		if (user_rooms === null) {
			throw new InternalServerErrorException();
		}
		user_rooms.user.rooms.map((aRoom) => {
			if (aRoom.name === room) {
				if (aRoom.accessibility === IRoomAccess.DirectMessage) {
					return null;
				}
				aRoom.participants.map(user => {
					if (user.id == Number(userId)) {
						console.log("user match: ", user.id)
						if (aRoom.owner.id === user_rooms.user.id) {
							return (this.roomMg.promoteToAdmin(aRoom, user));
						}
					}
				})
			}
		})
	}

	@Post('user-kick')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async userKickValidation(@Body('room') room: string, @Body('user') userId: string, @Req() req: Request): Promise<string> {
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		if (user_rooms === null) {
			throw new InternalServerErrorException("Something went wrong")
		}
		const valRoom : IRoom | null = this.chatService.validateForOperation(user_rooms.user.rooms, user_rooms.user, Number(userId), room);
		if (valRoom === null) {
			throw new BadRequestException("You cannot perform this action");
		}
		const newValRoom = await this.roomMg.kickUser(Number(userId), valRoom);
		if (newValRoom === null) {
			throw new InternalServerErrorException("Something went wrong")
		}
		this.roomMg.server.to(newValRoom.name).emit("roomUpdate", { room: newValRoom });
		return "You kicked that user out";
	}

	@Post('user-ban')
	@UseGuards(AuthGuard)
	async userBanValidation(@Body('room') room: string, @Body('user') userId: string, @Body('time') time: string, @Req() req: Request): Promise<void | string> {
		const timeNum = Number(time);
		if (timeNum === 0 || Number.isNaN(timeNum)) {
			throw new BadRequestException("Put proper time!");
		}
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		if (user_rooms === null) {
			throw new InternalServerErrorException("Something went wrong")
		}
		const valRoom : IRoom | null = this.chatService.validateForOperation(user_rooms.user.rooms, user_rooms.user, Number(userId), room);
		if (valRoom === null) {
			throw new BadRequestException("You cannot perform this action");
		}
		const newValRoom = await this.roomMg.banUser(Number(userId), valRoom, timeNum);
		if (newValRoom === null) {
			throw new InternalServerErrorException("Something went wrong")
		}
		this.roomMg.server.to(newValRoom.name).emit("roomUpdate", { room: newValRoom });
		return ("You banned that user for " + timeNum + " minutes!");
	}
	
	@Post('user-mute')
	@UseGuards(AuthGuard)
	async userMuteValidation(@Body('room') room: string, @Body('user') userId: string, @Body('time') time: string, @Req() req: Request): Promise<string>
	{
		const timeNum = Number(time);
		if (timeNum === 0 || Number.isNaN(timeNum)) {
			throw new BadRequestException("Put proper time!");
		}
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		if (user_rooms === null) {
			throw new InternalServerErrorException("Something went wrong")
		}
		const valRoom : IRoom | null = this.chatService.validateForOperation(user_rooms.user.rooms, user_rooms.user, Number(userId), room);
		if (valRoom === null) {
			throw new BadRequestException("You cannot perform this action");
		}
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
