import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { unlink, readFileSync } from 'fs';
import { AppUser, Session } from '@prisma/client';

@Injectable()
export class ContentService {
	constructor( private prisma: PrismaService ) {}

	async verifyFileContent(file_path: string) : Promise<string> {
		let file_buffer = readFileSync(file_path);
		var arr = new Uint8Array(file_buffer).subarray(0, 4);
		var header = '';
		
		for(var i = 0; i < arr.length; i++) {
			header += arr[i].toString(16);
		}
		
		switch(true) {
			case /^89504e47/.test(header):
			return 'image/png';
			case /^47494638/.test(header):
			return 'image/gif';
			case /^424d/.test(header):
			return 'image/bmp';
			case /^ffd8ff/.test(header):
			return 'image/jpeg';
			default:
			return 'unknown';
		}
	}

	async updateAvatar(sessionid: string, new_path: string) : Promise<{new_path: string}> {
		return await this.prisma.session.update({
			where: { id: sessionid },
			data: {
				user: {
					update: { avatar: new_path }
				}
			}
		})
		.then(() => ({new_path: new_path}))
		.catch((err: any) => {
			console.log(err);
			return ({new_path: "icons/42wolfsburg.jpeg"});
		})
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

	deleteUpload(file_path: string): void {
		unlink(file_path, (err: any) => {
			console.log(err);
		})
	}

	async isTaken(uname: string): Promise<boolean> {
		if (await this.prisma.appUser.findFirst({
			where: { display_name: uname }
		}) === null)
			return (false);
		return true;
	}
}