import { ActionNameEnum } from "@app/types/enums";
import { IAction } from "@app/types/interfaces";

import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Quest } from "./quest.entity";
import { Badge } from "./badge.entity";
import { Activity } from "./activity.entity";

@Entity("actions")
export class Action extends BaseEntity implements IAction {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "name", type: "enum", enum: ActionNameEnum, nullable: false })
  name: ActionNameEnum;

  // Relations
  @OneToMany(() => Quest, (quest) => quest.action)
  readonly quests: Quest[];

  @OneToMany(() => Badge, (badge) => badge.action)
  readonly badges: Badge[];

  @OneToMany(() => Activity, (activity) => activity.action)
  readonly activities: Activity[];
}
