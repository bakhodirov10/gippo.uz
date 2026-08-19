import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        doctorProfile: {
          select: { id: true, verificationStatus: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive or disabled');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      doctorProfileId: user.doctorProfile?.id,
      verificationStatus: user.doctorProfile?.verificationStatus,
    };
  }
}
