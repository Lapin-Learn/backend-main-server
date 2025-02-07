import { UnitOfWorkService } from "@app/database";
import { CallHandler, ExecutionContext, NestInterceptor, Injectable, Scope } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable({ scope: Scope.REQUEST })
export class Transactional implements NestInterceptor {
  constructor(private readonly unitOfWork: UnitOfWorkService) {}

  async intercept(_: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    return this.unitOfWork.doTransactional(next);
  }
}
