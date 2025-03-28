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
import { IntervalTypeEnum, MissionCategoryNameEnum } from "@app/types/enums";
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

  @Column({ name: "quantity", type: "int", nullable: false })
  quantity: number;

  @Column({ name: "rewards", type: "int", nullable: false, default: 0 })
  rewards: number;

  @Column({ name: "type", type: "enum", enum: IntervalTypeEnum, nullable: false })
  type: IntervalTypeEnum;

  @Column({ name: "category", type: "varchar", length: 255, nullable: false })
  category: MissionCategoryNameEnum;

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

  // Active Record Pattern
  static async randAndFind(intervalType: IntervalTypeEnum, limit: number): Promise<IQuest[]> {
    return this.createQueryBuilder("quests")
      .where("quests.type = :intervalType", { intervalType })
      .orderBy("RANDOM()")
      .limit(limit)
      .getMany();
  }
}
