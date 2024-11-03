import { IItem } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProfileItem } from "./profile-item.entity";
import { Bucket } from "./bucket.entity";
import { ItemCategoryEnum } from "@app/types/enums";

@Entity({ name: "items" })
export class Item extends BaseEntity implements IItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "description", type: "text", nullable: false })
  description: string;

  @Column({ name: "price", type: "jsonb", nullable: false })
  price: object;

  @Column({ name: "duration", type: "int", nullable: false })
  duration: number;

  @Column({ name: "image_id", type: "uuid" })
  imageId: string;

  @Column({ name: "category", type: "enum", enum: ItemCategoryEnum, nullable: false })
  category: ItemCategoryEnum;

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

  // Relations
  @OneToMany(() => ProfileItem, (profileItem) => profileItem.item)
  profileItems: ProfileItem[];

  @OneToOne(() => Bucket)
  @JoinColumn({ name: "image_id", referencedColumnName: "id" })
  image: Bucket;
}
