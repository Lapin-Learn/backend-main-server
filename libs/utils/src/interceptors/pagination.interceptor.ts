import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const request = context.switchToHttp().getRequest();
        const { offset = 0, limit = 10 } = request.query;

        const numericOffset = Number(offset);
        const numericLimit = Number(limit);

        const total = data?.length || 0;
        const page = Math.floor(offset / limit) + 1 || 0;

        return {
          items: data,
          total,
          offset: numericOffset,
          limit: numericLimit,
          page,
        };
      })
    );
  }
}
