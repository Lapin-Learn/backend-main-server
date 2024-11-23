import {
  AfterLoad,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { IProfileItem } from "@app/types/interfaces";
import { LearnerProfile } from "./learner-profile.entity";
import { Item } from "./item.entity";
import { ProfileItemStatusEnum } from "@app/types/enums";

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

  @Column({ name: "in_use_quantity", type: "int", nullable: false, default: 0 })
  inUseQuantity: number;

  @Column({
    name: "status",
    type: "enum",
    enum: ProfileItemStatusEnum,
    nullable: false,
    default: ProfileItemStatusEnum.UNUSED,
  })
  status: ProfileItemStatusEnum;

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

  @ManyToOne(() => Item, (item) => item.id, { eager: true })
  @JoinColumn({ name: "item_id", referencedColumnName: "id" })
  item: Item;

  @AfterLoad()
  async resetItemStatus() {
    const now = new Date();
    if (now >= this.expAt && this.status === ProfileItemStatusEnum.IN_USE) {
      this.status = ProfileItemStatusEnum.UNUSED;
      this.inUseQuantity = 0;
      this.expAt = null;
    }
  }
}
