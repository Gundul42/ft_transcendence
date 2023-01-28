import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { unlink } from 'fs';
import { AppUser, Session } from '@prisma/client';

@Injectable()
export class ContentService {
	constructor( private prisma: PrismaService ) {}

	async updateAvatar(sessionid: string, new_path: string) : Promise<{new_path: string}> {
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

	async updateDisplayName(sessionid: string, new_name: string) : Promise<Session & { user: AppUser }> {
		return await this.prisma.session.update({
			where: {
			  id: sessionid,
			},
			data: {
			  user: {
				update: {
					display_name: new_name,
				}
			  }
			},
			include : { user: true }
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
	}

	deleteAvatar(sessionid: string): void {
		this.prisma.session.findUnique({
			where: { id: sessionid },
			include: { user: true }
		})
		.then(
			(session: Session & { user: AppUser }) => {
				if (session.user.avatar === "icons/42wolfsburg.jpeg")
					return ;
				unlink("/home/app_backend/content/" + session.user.avatar, (err: any) => {
					console.log(err);
					return ;
				})
			},
			(err: any) => {
				console.log(err);
			}
		)
		.catch((err: any) => { console.log(err) })
	}
}