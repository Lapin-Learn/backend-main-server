import { IQuest } from "@app/types/interfaces";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Action } from "./action.entity";
import { IntervalTypeEnum } from "@app/types/enums";

@Entity({ name: "quests" })
export class Quest extends BaseEntity implements IQuest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "description", type: "text", nullable: false })
  description: string;

  @Column({ name: "action_id", type: "uuid", nullable: false })
  actionId: string;

  @Column({ name: "requirements", type: "int", nullable: false, default: 0 })
  requirements: number;

  @Column({ name: "rewards", type: "int", nullable: false, default: 0 })
  rewards: number;

  @Column({ name: "types", type: "enum", enum: IntervalTypeEnum, nullable: false })
  types: IntervalTypeEnum;

  @OneToOne(() => Action)
  @JoinColumn({ name: "action_id", referencedColumnName: "id" })
  action: Action;
}
