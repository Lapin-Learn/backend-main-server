import { ActionNameEnum } from "@app/types/enums";
import { IAction } from "@app/types/interfaces";

import { BaseEntity, Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Quest } from "./quest.entity";
import { Badge } from "./badge.entity";

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
}
