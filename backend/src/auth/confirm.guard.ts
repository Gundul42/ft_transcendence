import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger, Ip } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class ConfirmGuard implements CanActivate {
	constructor(private authService: AuthService) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const req = context.switchToHttp().getRequest<Request>();

		return this.authService.confirmSignup(req, req.ip);
	}
}
