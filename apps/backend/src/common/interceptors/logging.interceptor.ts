import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const userId = request.user?.id;

    console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip} - User: ${userId ?? 'anonymous'} - UA: ${userAgent}`);

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        console.log(`[${new Date().toISOString()}] ${method} ${url} - ${Date.now() - now}ms`);
      }),
    );
  }
}