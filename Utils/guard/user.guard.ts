import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { httpErrorException } from 'src/app.exception';
import { config } from 'dotenv';
import { RequestWithUser } from 'types/types';

config();

const USER_ACCESS_JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN = process.env.ACTUAL_ACCESS;

@Injectable()
export class JwtAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new httpErrorException('Invalid credentials, please sign in.', 401);
        }

        try {
            const payload: any = jwt.verify(token, USER_ACCESS_JWT_SECRET);
            request.user = payload;

            const {
                accessToken: accessToken
            } = request.user;

            if (accessToken !== ACCESS_TOKEN) {
                throw new httpErrorException('Invalid access token, please retry.', 401);
            }

            return true;
        } catch (error) {
            throw new httpErrorException('Invalid credentials, please retry..', 401);
        }
    }

    private extractTokenFromHeader(
        request: RequestWithUser,
    ): string | null {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return null;
        }

        const [bearer, token] = authHeader.split(' ');
        return bearer === 'Bearer' && token ? token : null;
    }
}