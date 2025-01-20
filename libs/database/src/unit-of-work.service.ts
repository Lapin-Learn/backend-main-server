import { TRANSACTION_MANAGER_STORAGE } from "@app/types/constants";
import { CallHandler, Injectable, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { AsyncLocalStorage } from "async_hooks";
import { DataSource, EntityManager } from "typeorm";
import { firstValueFrom, Observable, of } from "rxjs";

@Injectable()
export class UnitOfWorkService {
  private readonly asyncLocalStorage: AsyncLocalStorage<any>;
  private readonly logger = new Logger(UnitOfWorkService.name);
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    this.logger.log("Load unit of work");
    this.asyncLocalStorage = new AsyncLocalStorage();
  }

  getManager(): EntityManager {
    const storage = this.asyncLocalStorage.getStore();
    if (storage && storage.has(TRANSACTION_MANAGER_STORAGE)) {
      return storage.get(TRANSACTION_MANAGER_STORAGE);
    }
    return this.dataSource.createEntityManager();
  }

  async doTransactional(fn: CallHandler): Promise<Observable<any>> {
    return await this.dataSource.transaction(async (manager) => {
      let response: Observable<any>;
      await this.asyncLocalStorage.run(new Map<string, EntityManager>(), async () => {
        this.asyncLocalStorage.getStore().set(TRANSACTION_MANAGER_STORAGE, manager);
        response = await firstValueFrom(fn.handle());
      });
      return of(response);
    });
  }
}
