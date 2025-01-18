import { Injectable, Scope } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityManager } from "typeorm";

@Injectable({
  scope: Scope.REQUEST,
})
export class UnitOfWorkService {
  private manager: EntityManager;
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    this.manager = this.dataSource.manager;
  }

  getManager() {
    return this.manager;
  }

  async doTransactional<T>(fn: any): Promise<T> {
    return await this.dataSource.transaction(async (manager) => {
      this.manager = manager;
      return fn(manager);
    });
  }
}
