import { UnauthorizedException, ExceptionFilter, Catch, ArgumentsHost, HttpException, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class AuthFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		console.log("Redirected on signup");
		const context = host.switchToHttp();
		const response = context.getResponse<Response>();
		const status = exception.getStatus();

		response.status(status).redirect('/api/auth/signup');
	}
}

@Catch(ForbiddenException)
export class TwoFAFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		console.log("Redirected on 2 Factor Authentication");
		const context = host.switchToHttp();
		const response = context.getResponse<Response>();
		const status = exception.getStatus();

		response.status(status).redirect('/api/auth/pass2FA');
	}
}