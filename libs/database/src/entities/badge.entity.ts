import { IBadge } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Action } from "./action.entity";
import { ProfileBadge } from "./profile-badge.entity";

@Entity({ name: "badges" })
export class Badge extends BaseEntity implements IBadge {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: "name", type: "varchar", nullable: false })
  name: string;

  @Column({ name: "description", type: "text", nullable: false })
  description: string;

  @Column({ name: "action_id", type: "int", nullable: false })
  actionId: string;

  @Column({ name: "requirements", type: "int", nullable: false, default: 0 })
  requirements: number;

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
  @ManyToOne(() => Action, (action) => action.id)
  @JoinColumn({ name: "action_id", referencedColumnName: "id" })
  action: Action;

  @OneToMany(() => ProfileBadge, (profileBadge) => profileBadge.badge)
  profileBadges: ProfileBadge[];
}
