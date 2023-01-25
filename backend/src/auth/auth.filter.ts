import { UnauthorizedException, ExceptionFilter, Catch, ArgumentsHost, HttpException, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class AuthFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		console.log("redirected on auth filter");
		const context = host.switchToHttp();
		const response = context.getResponse<Response>();
		const status = exception.getStatus();

		response.status(status).redirect('/api/signup');
	}
}

@Catch(ForbiddenException)
export class TwoFAFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		console.log("redirected on 2fa filter");
		const context = host.switchToHttp();
		const response = context.getResponse<Response>();
		const status = exception.getStatus();

		response.status(status).redirect('/api/pass2FA');
	}
}