import { DataSource, EntitySubscriberInterface, EventSubscriber } from "typeorm";
import { Bucket } from "../entities";
import { Inject, Injectable } from "@nestjs/common";
import { BucketService } from "apps/main-api/src/modules/bucket/bucket.service";
import { IBucket } from "@app/types/interfaces";

interface IBucketAfterLoad extends IBucket {
  url: string;
}

// Main idea come from this: https://stackoverflow.com/a/62094103
// Modify some part using this: https://stackoverflow.com/a/78517924
@Injectable()
@EventSubscriber()
export class BucketSubscriber implements EntitySubscriberInterface<IBucket> {
  constructor(
    @Inject(DataSource) dataSource: DataSource,
    private readonly bucketService: BucketService
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo(): typeof Bucket {
    return Bucket;
  }

  async afterLoad(entity: Bucket): Promise<void> {
    const url = await this.bucketService.getPresignedDownloadUrlForAfterLoad(entity);
    (entity as unknown as IBucketAfterLoad).url = url;
  }
}
