import { MissionTypeEnum } from "@app/types/enum";
import { IMission } from "@app/types/interfaces";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Quest } from "./quest.entity";

@Entity({ name: "missions" })
export class Mission extends BaseEntity implements IMission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "mission_type", type: "enum", enum: MissionTypeEnum, nullable: false })
  missionType: MissionTypeEnum;

  @OneToOne(() => Quest)
  @JoinColumn({ name: "quest_id", referencedColumnName: "id" })
  questId: Quest;
}
