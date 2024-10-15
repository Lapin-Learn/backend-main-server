import { IntervalTypeEnum } from "@app/types/enums";
import { IMission } from "@app/types/interfaces";
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
import { Quest } from "./quest.entity";
import { ProfileMissionProgress } from "./profile-mission-progress.entity";

@Entity({ name: "missions" })
export class Mission extends BaseEntity implements IMission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "types", type: "enum", enum: IntervalTypeEnum, nullable: false })
  types: IntervalTypeEnum;

  @Column({ name: "quest_id", type: "uuid", nullable: false })
  questId: string;

  @Column({ name: "quantity", type: "int", nullable: false })
  quantity: number;

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
  @ManyToOne(() => Quest, (quest) => quest.id, { eager: true })
  @JoinColumn({ name: "quest_id", referencedColumnName: "id" })
  quest: Quest;

  @OneToMany(() => ProfileMissionProgress, (profileMissionProgress) => profileMissionProgress.mission)
  profileMissionsProgress: ProfileMissionProgress[];
}
