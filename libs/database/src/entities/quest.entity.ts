import { IQuest } from "@app/types/interfaces";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Action } from "./action.entity";

@Entity({ name: "quests" })
export class Quest extends BaseEntity implements IQuest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "description", type: "text", nullable: false })
  description: string;

  @Column({ name: "requirements", type: "int", nullable: false })
  requirements: number;

  @Column({ name: "rewards", type: "int", nullable: false })
  rewards: number;

  @OneToOne(() => Action)
  @JoinColumn({ name: "action_id", referencedColumnName: "id" })
  actionId: Action;
}
