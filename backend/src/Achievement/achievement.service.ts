import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Achieve, AppUser, Session } from '@prisma/client';
import { IAchieve } from '../Interfaces';

@Injectable()
export class AchievementService {
	constructor (private prisma: PrismaService) {}

	async grantAchievement(userid: number, achievement: IAchieve) : Promise<void> {
		console.log("achievement eval")
		const user: AppUser & { achievements: Achieve[] } = await this.prisma.appUser.findUnique({
			where: { id: userid },
			include: {
				achievements: {
					select: { name: true }
				}
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
		if (user === null || (user.achievements as Achieve[]).filter(e => e.name === achievement.name).length > 0) return ;
		console.log("achievement eval")
		this.prisma.achieve.create({
			data: {
				name: achievement.name,
				description: achievement.description,
				logo: achievement.logo,
				user: {
					connect: { id: userid }
				}
			}
		})
		.catch((err: any) => {console.log(err)});
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

	async aknowledge(user_id: number, achievement_id: number) : Promise<boolean> {
		const achievement: Achieve & { user: AppUser } = await this.prisma.achieve.findUnique({
			where: { id: achievement_id },
			include: { user: true }
		})
		.catch((err: any) => {
			console.log("ACHIEVEMENT AKNOWLEDGEMENT ERROR: ", err);
			return null;
		})
		if (achievement === null || achievement.user.id !== user_id) return false;
		return await this.prisma.achieve.update({
			where: { id: achievement_id },
			data: {
				aknowledged: true
			}
		})
		.then(() => true)
		.catch((err: any) => {
			console.log("ACHIEVEMENT AKNOWLEDGEMENT ERROR: ", err);
			return false;
		})
	}
}