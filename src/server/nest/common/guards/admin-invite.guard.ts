import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminInviteGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminSecretHeader = request.headers['x-admin-invite-secret'];
    const adminSecretBody = request.body?.adminInviteSecret;

    const expectedSecret = this.configService.get<string>('ADMIN_REGISTRATION_SECRET');

    if (!expectedSecret) {
      throw new UnauthorizedException('Admin registration is currently disabled on this server');
    }

    const providedSecret = adminSecretHeader || adminSecretBody;

    if (!providedSecret || providedSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid or missing Admin Invitation Secret');
    }

    return true;
  }
}
