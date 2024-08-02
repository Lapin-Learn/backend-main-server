import { ActionNameEnum } from "@app/types/enum";
import { IAction } from "@app/types/interfaces";

import { BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

export class Action extends BaseEntity implements IAction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "name", type: "enum", enum: ActionNameEnum, nullable: false })
  name: ActionNameEnum;
}
