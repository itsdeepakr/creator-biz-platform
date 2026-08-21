import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // If data is already structured with statusCode/timestamp or is a stream/buffer/raw response
        if (data && typeof data === 'object' && ('statusCode' in data || 'data' in data)) {
          return data;
        }
        return {
          statusCode,
          timestamp: new Date().toISOString(),
          path: context.switchToHttp().getRequest().url,
          data,
        };
      }),
    );
  }
}
