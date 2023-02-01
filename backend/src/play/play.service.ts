// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { Queue, Match, AppUser } from '@prisma/client';

// @Injectable()
// export class PlayService {
// 	constructor(private prisma: PrismaService) {}

// 	async getFirstInLine(user: AppUser): Promise<any> {
// 		return await this.prisma.queue.findFirst({
// 			where: {
// 				user: {
// 					is: { ladder_level: user.ladder_level }
// 				}
// 			},
// 			orderBy : { created_at: 'asc' },
// 			include: { user: true },
// 		})
// 		.then(async (first) => {
// 			if (first === null) {
// 				return await this.prisma.queue.findFirst({
// 					orderBy : { created_at: 'asc' },
// 					include : { user: true }
// 				})
// 			} else {
// 				return first;
// 			}
// 		})
// 		.catch((error) => {
// 			console.log(error);
// 			return null;
// 		});
// 	}

// 	async addUserToQueue(user: AppUser): Promise<void> {
// 		await this.prisma.queue.create({
// 			data: {
// 				user: {
// 					connect: { id: user.id }
// 				}
// 			}
// 		})
// 	}

// 	async getMatch(user: AppUser): Promise<Match> {
// 		return await this.prisma.match.findFirst({
// 			where: {
// 				OR: [
// 					{ player1id: user.id },
// 					{ player2id: user.id }
// 				],
// 				finished_at: null
// 			}
// 		})
// 	}

// 	async createNewMatch(user1: AppUser, user2: AppUser): Promise<Match> {
// 		return await this.prisma.match.create({
// 			data: {
// 				player1: {
// 					connect: { id: user1.id }
// 				},
// 				player2: {
// 					connect: { id: user2.id }
// 				},
// 				ladder: user1.ladder_level
// 			}
// 		})
// 	}
// }