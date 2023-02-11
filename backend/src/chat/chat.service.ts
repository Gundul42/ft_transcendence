import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Session, AppUser, Room } from '@prisma/client';
import { IRoom } from '../Interfaces';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async getRooms(sessionid: string) : Promise<Session & { user: AppUser & { rooms: IRoom[] } }> {
		const blocked_list: number[] = [];
		await this.prisma.session.findUnique({
			where: { id: sessionid },
			include: {
				user: {
					include: { blocked: true }
				}
			}
		})
		.then((session: Session & { user: AppUser & { blocked: AppUser[] } }) => {
			(session.user.blocked as AppUser[]).map((blocked_user) => {
				blocked_list.push(blocked_user.id);
			})
		})
		.catch((err: any) => {console.log(err)});
		return await this.prisma.session.findUnique({
			where: { id: sessionid },
			include: {
				user: {
					include: {
						rooms: {
							select: {
								id: true,
								participants: {
									select: {
										id: true,
										display_name: true,
										avatar: true,
										status: true
									}
								},
								administrators: {
									select: {
										id: true,
										display_name: true,
										avatar: true,
										status: true
									}
								},
								penalties: true,
								accessibility: true,
								name: true,
								messages: {
									where: {
										appUserId: { notIn: blocked_list }
									}
								}
							}
						}
					}
				}
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		})
	}
}
