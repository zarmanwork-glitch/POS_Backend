import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class HttpCodeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req: any = http.getRequest();
    const res: any = http.getResponse();

    try {
      const method = (req?.method || '').toUpperCase();
      const url = req?.url || '';

      // If it's a POST to a "list" route, set status to 200 instead of default 201
      if (
        method === 'POST' &&
        (/\/list($|\/)/.test(url) || /listForSelection/.test(url))
      ) {
        res.status(200);
      }
    } catch (e) {
      // no-op: don't block the request on interceptor failure
    }

    return next.handle();
  }
}
