import { Injectable } from "@nestjs/common";
import {
  BaseEntity,
  Repository,
  FindOneOptions,
  FindManyOptions,
  DeepPartial,
  DeleteResult,
  ObjectId,
  FindOptionsWhere,
} from "typeorm";

@Injectable()
export class BaseRepository<T extends BaseEntity> {
  constructor(protected repository: Repository<T>) {}

  findAll(option?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(option);
  }

  findOne(data: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(data);
  }

  save(data: DeepPartial<T>): Promise<T> {
    return this.repository.save(data);
  }

  delete(
    data: string | number | Date | ObjectId | string[] | number[] | Date[] | ObjectId[] | FindOptionsWhere<T>
  ): Promise<DeleteResult> {
    return this.repository.delete(data);
  }

  async updateOne(data: FindOneOptions<T>, updateData: DeepPartial<T>): Promise<T> {
    const existedData = await this.repository.findOne(data);
    return this.repository.save({ ...existedData, ...updateData });
  }
}
