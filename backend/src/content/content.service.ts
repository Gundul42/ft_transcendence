import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { unlink } from 'fs';

@Injectable()
export class ContentService {
	constructor( private prisma: PrismaService ) {}

	async updateAvatar(sessionid: string, new_path: string): Promise<any> {
		await this.prisma.session.update({
			where: { id: sessionid },
			data: {
				user: {
					update: { avatar: new_path }
				}
			}
		})
		return ({new_path: new_path});
	}

	deleteAvatar(sessionid: string): void {
		this.prisma.session.findUnique({
			where: { id: sessionid },
			include: { user: true }
		})
		.then(
			(session) => {
				if (session.user.avatar === "icons/42wolfsburg.jpeg")
					return ;
				unlink("/home/app_backend/content/" + session.user.avatar, (err) => {
					console.log(err);
					return ;
				})
			},
			(err) => {
				console.log(err);
			}
		)
	}
}