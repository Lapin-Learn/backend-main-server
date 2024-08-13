import { BucketPermissionsEnum, BucketUploadStatusEnum } from "@app/types/enums";
import { IBucket } from "@app/types/interfaces";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "buckets" })
export class Bucket extends BaseEntity implements IBucket {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "owner", type: "uuid", nullable: false })
  owner: string;

  @Column({
    name: "permission",
    type: "enum",
    enum: BucketPermissionsEnum,
    default: BucketPermissionsEnum.PUBLIC,
    nullable: false,
  })
  permission: BucketPermissionsEnum;

  @CreateDateColumn({ name: "created_at", type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @Column({
    name: "upload_status",
    type: "enum",
    enum: BucketUploadStatusEnum,
    default: BucketUploadStatusEnum.PENDING,
    nullable: false,
  })
  uploadStatus: BucketUploadStatusEnum;
}
