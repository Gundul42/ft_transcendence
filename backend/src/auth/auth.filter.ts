import { UnauthorizedException, ExceptionFilter, Catch, ArgumentsHost, HttpException, } from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class AuthFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const context = host.switchToHttp();
		const response = context.getResponse<Response>();
		const status = exception.getStatus();

		response.status(status).redirect('/api/signup');
	}
}