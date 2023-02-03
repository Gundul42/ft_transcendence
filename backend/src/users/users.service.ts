import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppUser, Session, UserRequest, Match } from '@prisma/client';

@Injectable()
export class UsersService {
	constructor( private prisma: PrismaService ) {}

	async findUser(userid: number) : Promise<AppUser & { matches_p1: Match[], matches_p2: Match[] }> {
		return await this.prisma.appUser.findUnique({
			where: { id: userid },
			include: {
				matches_p1: true,
				matches_p2: true
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
	}

	async getReqUser(sessionid: string) : Promise<Session & {user: AppUser}> {
		return await this.prisma.session.findUnique({
			where: {id: sessionid},
			include: {user: true}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		})
	}

	async verifyFriendship(l_id: number, r_id: number) : Promise<boolean> {
		return await this.prisma.appUser.findUnique({
			where: { id: l_id },
			include: { friends: true }
		})
		.then((user: AppUser & { friends: AppUser[]}) => {
			for (let i = 0; i < user.friends.length; i++) {
				if (user.friends[i].id === r_id) {
					return true;
				}
			}
			return false;
		})
		.catch((err: any) => {
			console.log(err);
			return false;
		})
	}

	async registerRequest(l_id: number, r_id: number, type: "game" | "friend") : Promise<boolean> {
		return await this.prisma.userRequest.create({
			data: {
				from: {
					connect: { id: l_id }
				},
				to: {
					connect: { id: r_id }
				},
				type: type
			}
		})
		.then(() => true)
		.catch((err: any) => {
			console.log(err);
			return false;
		})
	}

	// async getUserRequests(sessionid: string) : Promise<Session & {user: AppUser & {requests_rec: UserRequest}}> {
	// 	return await this.prisma.session.findUnique({
	// 		where: {id: sessionid},
	// 		include: {
	// 			user: {
	// 				include: {requests_rec: true}
	// 			}
	// 		}
	// 	})
	// 	.catch((err: any) => {
	// 		console.log(err);
	// 		return null;
	// 	})
	// }

	async getRequest(id: number) : Promise<UserRequest> {
		return await this.prisma.userRequest.findUnique({
			where: { id: id }
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		})
	}

	async recordFriendship(uid_l: number, uid_r: number) : Promise<void> {
		await this.prisma.appUser.update({
			where: { id: uid_l },
			data: {
				friends: {
					connect: { id: uid_r }
				}
			}
		})
		.catch((err: any) => {console.log(err)});
		await this.prisma.appUser.update({
			where: { id: uid_r },
			data: {
				friends: {
					connect: { id: uid_l }
				}
			}
		})
		.catch((err: any) => {console.log(err)});
	}

	async deleteRequest(id: number) : Promise<void> {
		await this.prisma.userRequest.delete({
			where: {id: id}
		})
		.catch((err: any) => {console.log(err)})
	}
}