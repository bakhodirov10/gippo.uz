export interface JwtPayloadUser {
    id: string;
    email: string;
    role: string;
    doctorProfileId?: string;
}
export declare const CurrentUser: (...dataOrPipes: (keyof JwtPayloadUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
