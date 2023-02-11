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
				if (aRoom.administrators[0].id === user_rooms.user.id)
					return (this.roomMg.changePassword(aRoom, password));
		})
		console.log("No matching room found/They aren't an owner");
	  }

	@Post('password-remove')
	@UseGuards(AuthGuard)
	async removePasswordValidation(@Body('room') room: string, @Req() req: Request): Promise<void> {
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		user_rooms.user.rooms.map((aRoom) =>
		{
			if (aRoom.name === room)
			{ 
				if (aRoom.administrators[0].id === user_rooms.user.id)
					return (this.roomMg.removePassword(aRoom));
			}
		})
		console.log("No matching room found/They aren't an owner");
	}

	@Post('admin-promotion')
	@UseGuards(AuthGuard)
	async promoteToAdminValidation(@Body('room') room: string, @Body('user') userId: number, @Req() req: Request): Promise<void>
	{
		console.log(userId);
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		user_rooms.user.rooms.map((aRoom) =>
		{
			if (aRoom.name === room)
			{
				aRoom.participants.map(user =>
				{
					if (user.id == userId)
					{
						console.log("user match: ", user.id)
						if (aRoom.administrators[0].id === user_rooms.user.id)
							return (this.roomMg.promoteToAdmin(aRoom, user));
					}
				})
			}
		})
		console.log("No matching room found/They aren't an owner");
	}

	@Post('user-kick')
	@UseGuards(AuthGuard)
	async userKickValidation(@Body('room') room: string, @Body('user') userId: string, @Body('reason') reason: string, @Req() req: Request): Promise<void>
	{
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		user_rooms.user.rooms.map((aRoom) =>
		{
			if (aRoom.name === room)
			{
				if (this.chatService.isAdmin(aRoom, user_rooms.user) === false)
					return ("Not an admin in this room")
				if (aRoom.administrators[0].id === Number(userId))
					return ("You can't kick the owner!");
				this.roomMg.kickUser(Number(userId), aRoom);
				return ("User " + userId + " was kicked because of: " + reason);
			}
		})
	}

	@Post('user-ban')
	@UseGuards(AuthGuard)
	async userBanValidation(@Body('room') room: string, @Body('user') userId: string, @Body('reason') reason: string, @Req() req: Request): Promise<void>
	{
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		user_rooms.user.rooms.map((aRoom) =>
		{
			if (aRoom.name === room)
			{
				if (this.chatService.isAdmin(aRoom, user_rooms.user) === false)
					return ("Not an admin in this room")
				if (aRoom.administrators[0].id === Number(userId))
					return ("You can't ban the owner!");
				this.roomMg.banUser(Number(userId), aRoom);
				return ("User " + userId + " was banned because of: " + reason);
			}
		})
	}
	
	@Post('user-mute')
	@UseGuards(AuthGuard)
	async userMuteValidation(@Body('room') room: string, @Body('user') userId: string, @Body('reason') reason: string, @Req() req: Request): Promise<void>
	{
		const user_rooms: Session & { user: AppUser & { rooms: IRoom[] }} = await this.chatService.getRooms(req.cookies["ft_transcendence_sessionId"]);
		user_rooms.user.rooms.map((aRoom) =>
		{
			if (aRoom.name === room)
			{
				if (this.chatService.isAdmin(aRoom, user_rooms.user) === false)
					return ("Not an admin in this room")
				if (aRoom.administrators[0].id === Number(userId))
					return ("You can't mute the owner!");
				this.roomMg.muteUser(Number(userId), aRoom);
				return ("User " + userId + " was muted because of: " + reason);
			}
		})
	}
}