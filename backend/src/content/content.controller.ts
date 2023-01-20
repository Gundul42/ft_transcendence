import { Controller, Get, Post, UseGuards, Res, Req, Param, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { ContentService } from './content.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('content')
export class ContentController {
	constructor(contentService: ContentService) {}

	@Get('img/:dir/:picture')
	@UseGuards(AuthGuard)
	loadPicture(@Res({passthrough: true }) res, @Param('dir') dir, @Param('picture') picture) : StreamableFile {
		const file = createReadStream(join('/home/app_backend/', dir, picture));
		res.set({
			'Content-Type': 'image/' + (picture as string).split('.').pop(),
			'Content-Disposition': 'attachment; filename="' + picture + '"',
		  });
		return new StreamableFile(file);
	}
}