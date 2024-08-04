import { ActionNameEnum } from "@app/types/enums";
import { IAction } from "@app/types/interfaces";

import { BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

export class Action extends BaseEntity implements IAction {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "name", type: "enum", enum: ActionNameEnum, nullable: false })
  name: ActionNameEnum;
}
