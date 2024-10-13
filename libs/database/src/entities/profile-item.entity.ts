import { IProfileItem } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { LearnerProfile } from "./learner-profile.entity";
import { Item } from "./item.entity";

@Entity({ name: "profile_items" })
export class ProfileItem extends BaseEntity implements IProfileItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "item_id", type: "uuid", nullable: false })
  itemId: string;

  @Column({ name: "profile_id", type: "uuid", nullable: false })
  profileId: string;

  @Column({ name: "quantity", type: "int", nullable: false, default: 1 })
  quantity: number;

  @Column({ name: "exp_at", type: "timestamp", nullable: false })
  expAt: Date;

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
  @ManyToOne(() => LearnerProfile, (profile) => profile.id)
  @JoinColumn({ name: "profile_id", referencedColumnName: "id" })
  profile: LearnerProfile;

  @ManyToOne(() => Item, (item) => item.id)
  @JoinColumn({ name: "item_id", referencedColumnName: "id" })
  item: Item;
}
