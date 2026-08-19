import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message: string;
  code: number;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        let message = 'Operation successful';
        let payload = data;

        if (data && typeof data === 'object' && 'message' in data && 'data' in data) {
          message = data.message;
          payload = data.data;
        }

        return {
          success: true,
          data: payload,
          message,
          code: statusCode,
        };
      }),
    );
  }
}
