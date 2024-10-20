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

  @Column({ name: "type", type: "enum", enum: IntervalTypeEnum, nullable: false })
  type: IntervalTypeEnum;

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

  getBonusResources() {
    const bonusCarrot = this.quest.rewards;
    let bonusXP = 0;

    switch (this.type) {
      case IntervalTypeEnum.DAILY:
        bonusXP = 10;
        break;
      case IntervalTypeEnum.MONTHLY:
        bonusXP = 100;
        break;
      default:
        bonusXP = 0;
        break;
    }

    return {
      bonusXP,
      bonusCarrot,
    };
  }

  // Active Record Patterns
  static async getMissions() {
    return this.createQueryBuilder("missions")
      .where(
        `(
          DATE(missions.created_at) = CURRENT_DATE AND 
          missions.type = :daily
        )
        OR 
        (
          EXTRACT(MONTH FROM missions.created_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND
          EXTRACT(YEAR FROM missions.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) AND
          missions.type = :monthly
        )`,
        { daily: IntervalTypeEnum.DAILY, monthly: IntervalTypeEnum.MONTHLY }
      )
      .leftJoinAndSelect("missions.quest", "quest")
      .getMany();
  }
}
