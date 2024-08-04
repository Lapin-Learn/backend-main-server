import { IntervalTypeEnum } from "@app/types/enums";
import { IMission } from "@app/types/interfaces";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Quest } from "./quest.entity";

@Entity({ name: "missions" })
export class Mission extends BaseEntity implements IMission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "types", type: "enum", enum: IntervalTypeEnum, nullable: false })
  types: IntervalTypeEnum;

  @Column({ name: "quest_id", type: "uuid", nullable: false })
  questId: string;

  // Relations
  @ManyToOne(() => Quest, (quest) => quest.id)
  @JoinColumn({ name: "quest_id", referencedColumnName: "id" })
  quest: Quest;
}
