import { Controller, Get, Post, UseGuards, Res, Req, Param, StreamableFile, UseInterceptors, UploadedFile, ParseFilePipeBuilder, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Request, Response } from 'express';
import { createReadStream } from 'fs';
import { join, extname } from 'path';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { ContentService } from './content.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('content')
export class ContentController {
	constructor(
		private contentService: ContentService,
		private prisma: PrismaService) {}

	@Get('img/:dir/:picture')
	@UseGuards(AuthGuard)
	downloadPicture(@Res({passthrough: true }) res, @Param('dir') dir, @Param('picture') picture) : StreamableFile {
		const file = createReadStream(join('/home/app_backend/content/', dir, picture));
		res.set({
			'Content-Type': 'image/' + (picture as string).split('.').pop(),
			'Content-Disposition': 'attachment; filename="' + picture + '"',
		});
		return new StreamableFile(file).setErrorHandler((err: any) => { console.log(err); });
	}

	@Post("display_name")
	@UseGuards(AuthGuard, JwtAuthGuard)
	async setDisplayName(@Req() req: Request, @Body('uname') uname: string): Promise<void> {
	  if (!uname || uname.length === 0) {
		console.log("You need to select a non empty username");
		return ;
	  }
	  await this.contentService.updateDisplayName(req.cookies['ft_transcendence_sessionId'], uname);
	}

	@Post('upload')
	@UseGuards(AuthGuard, JwtAuthGuard)
	@UseInterceptors(FileInterceptor('avatar', {
		limits: {
			files: 1,
		},
		storage: diskStorage({
			destination: "/home/app_backend/content/upload",
			filename(req, file, cb) {
				cb(null, uuidv4() + extname(file.originalname));
			}
		})
	}))
	async uploadPicture(
		@UploadedFile(
			new ParseFilePipeBuilder()
			.addFileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ })
			.addMaxSizeValidator({ maxSize: 5000000 })
			.build(),
		) avatar: Express.Multer.File,
		@Req() req: Request)
	: Promise<any> {
		if (await this.contentService.verifyFileContent(avatar.path) === "unknown") {
			this.contentService.deleteUpload(avatar.path);
			return ({ new_path: "icons/nggyu.gif"})
		}
		this.contentService.deleteAvatar(req.cookies["ft_transcendence_sessionId"]);
		return await this.contentService.updateAvatar(req.cookies["ft_transcendence_sessionId"], "upload/" + avatar.filename);
	}
}