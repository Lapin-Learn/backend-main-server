import { IBadge } from "@app/types/interfaces";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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

  @Column({ name: "action_id", type: "uuid", nullable: false })
  actionId: string;

  @Column({ name: "requirements", type: "int", nullable: false, default: 0 })
  requirements: number;

  // Relations
  @ManyToOne(() => Action, (action) => action.id)
  @JoinColumn({ name: "action_id", referencedColumnName: "id" })
  action: Action;

  @OneToMany(() => ProfileBadge, (profileBadge) => profileBadge.badge)
  profileBadges: ProfileBadge[];
}
