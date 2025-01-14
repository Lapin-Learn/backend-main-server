import { NestInterceptor, Injectable, Logger, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    Logger.log({ message: `${req.method}: ${req.url}`, query: req.query, body: req.body, ip: req.ip });
    return next.handle().pipe();
  }
}
