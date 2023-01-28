import { Injectable, CanActivate, ExecutionContext} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private authService: AuthService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();

		return (await this.authService.validateSession(req) && await this.authService.validate2FA(req));
	}
}
