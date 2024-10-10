import { IQuest } from "@app/types/interfaces";
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
import { IntervalTypeEnum } from "@app/types/enums";
import { Mission } from "./mission.entity";

@Entity({ name: "quests" })
export class Quest extends BaseEntity implements IQuest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "description", type: "text", nullable: false })
  description: string;

  @Column({ name: "action_id", type: "int", nullable: false })
  actionId: string;

  @Column({ name: "requirements", type: "int", nullable: false, default: 0 })
  requirements: number;

  @Column({ name: "rewards", type: "int", nullable: false, default: 0 })
  rewards: number;

  @Column({ name: "types", type: "enum", enum: IntervalTypeEnum, nullable: false })
  types: IntervalTypeEnum;

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

  @OneToMany(() => Mission, (mission) => mission.quest)
  missions: Mission[];
}
