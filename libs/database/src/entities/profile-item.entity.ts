import { IProfileItem } from "@app/types/interfaces";
import { BaseEntity, Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LearnerProfile } from "./learner-profile.entity";
import { Item } from "./item.entity";

export class ProfileItem extends BaseEntity implements IProfileItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "item_id", type: "uuid", nullable: false })
  itemId: string;

  @Column({ name: "profile_id", type: "uuid", nullable: false })
  profileId: string;

  @Column({ name: "quantity", type: "int", nullable: false, default: 1 })
  quantity: number;

  @Column({ name: "exp_on", type: "timestamp", nullable: false })
  expOn: Date;

  // Relations
  @ManyToOne(() => LearnerProfile, (profile) => profile.id)
  @JoinColumn({ name: "profile_id", referencedColumnName: "id" })
  profile: LearnerProfile;

  @ManyToOne(() => Item, (item) => item.id)
  @JoinColumn({ name: "item_id", referencedColumnName: "id" })
  item: Item;
}
