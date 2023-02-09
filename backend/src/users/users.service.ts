import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppUser, Session, UserRequest, Match, Achieve } from '@prisma/client';
import { IUserPublic } from '../Interfaces';

@Injectable()
export class UsersService {
	constructor( private prisma: PrismaService ) {}

	async findUser(userid: number) : Promise<AppUser & { achievements: Achieve[], matches_won: (Match & { winner: IUserPublic, loser: IUserPublic})[], matches_lost: (Match & { winner: IUserPublic, loser: IUserPublic})[] }> {
		return await this.prisma.appUser.findUnique({
			where: { id: userid },
			include: {
				achievements: true,
				matches_won: {
					orderBy: { started_at: "desc" },
					include: {
						winner: {
						  select: {
							id: true,
							display_name: true,
							avatar: true,
							status: true
							}
						},
						loser: {
							select: {
								id: true,
								display_name: true,
								avatar: true,
								status: true
							}
						}
					  }
				},
				matches_lost: {
					orderBy: { started_at: "desc" },
					include: {
						winner: {
							select: {
								id: true,
								display_name: true,
								avatar: true,
								status: true
							}
						},
						loser: {
							select: {
								id: true,
								display_name: true,
								avatar: true,
								status: true
							}
						}
					}
				}
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

	async verifyExistingRequest(l_id: number, r_id: number) : Promise<boolean> {
		const request: UserRequest | null = await this.prisma.userRequest.findFirst({
			where: {
				OR: [
					{
						sender_id: { equals: l_id},
						receiver_id: {equals: r_id}
					},
					{
						receiver_id: { equals: l_id},
						sender_id: {equals: r_id}
					},
				]
			},
			include: {
				from: true,
				to: true
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		})
		if (request === null) {
			return false;
		} else {
			return true;
		}
	}

	async registerRequest(l_id: number, r_id: number, type: "game" | "friend") : Promise<UserRequest> {
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
		.catch((err: any) => {
			console.log(err);
			return null;
		})
	}

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

	composeMatchHistory(user: AppUser & { matches_won: (Match & { winner: IUserPublic, loser: IUserPublic})[], matches_lost: (Match & { winner: IUserPublic, loser: IUserPublic})[] }) : (Match & { winner: IUserPublic, loser: IUserPublic})[] {
		let res: (Match & { winner: IUserPublic, loser: IUserPublic})[] = [];
		let i: number = 0;
		let j: number = 0;
		
		while (i < (user.matches_won as (Match & { winner: IUserPublic, loser: IUserPublic})[]).length && j < (user.matches_lost as (Match & { winner: IUserPublic, loser: IUserPublic})[]).length) {
			if ((user.matches_won[i].started_at as Date) < (user.matches_lost[j].started_at as Date)) {
				res.push(user.matches_won[i]);
				i++;
			} else {
				res.push(user.matches_lost[j]);
				j++;
			}
		}
		while (i < (user.matches_won as (Match & { winner: IUserPublic, loser: IUserPublic})[]).length) {
			res.push(user.matches_won[i]);
			i++;
		}
		while (j < (user.matches_lost as (Match & { winner: IUserPublic, loser: IUserPublic})[]).length) {
			res.push(user.matches_lost[j]);
			j++;
		}
		return (res);
	}

	async removeFriendship(uid_l: number, uid_r: number) : Promise<boolean> {
		const res_1: boolean = await this.prisma.appUser.update({
			where: { id: uid_l },
			data: {
				friends: {
					disconnect: { id: uid_r }
				}
			}
		})
		.then(() => true)
		.catch((err: any) => {
			console.log(err);
			return false;
		})

		const res_2: boolean = await this.prisma.appUser.update({
			where: { id: uid_r },
			data: {
				friends: {
					disconnect: { id: uid_l }
				}
			}
		})
		.then(() => true)
		.catch((err: any) => {
			console.log(err);
			return false;
		})
		return (res_1 && res_2);
	}

	async getAllUsers(partial_name: string) : Promise<IUserPublic[]> {
		return await this.prisma.appUser.findMany({
			where: {
				display_name: { contains: partial_name }
			},
			select: {
				id: true,
				display_name: true,
				avatar: true,
				status: true
			}
		})
		.catch((err: any) => {
			console.log(err);
			return ([]);
		})
	}
}