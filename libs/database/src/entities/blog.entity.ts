import { IBlog, IBucket } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Bucket } from "./bucket.entity";

@Entity({ name: "blogs" })
export class Blog extends BaseEntity implements IBlog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "title", type: "text", nullable: false, default: "" })
  title: string;

  @Column({ name: "content", type: "text", nullable: false, default: "" })
  content: string;

  @Column({ name: "thumbnail_id", type: "uuid", nullable: false })
  thumbnailId: string;

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

  @OneToOne(() => Bucket, { eager: true })
  @JoinColumn({ name: "thumbnail_id", referencedColumnName: "id" })
  readonly thumbnail: IBucket;
}
