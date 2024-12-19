import { IActivity } from "@app/types/interfaces";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LearnerProfile } from "./learner-profile.entity";
import { Action } from "./action.entity";
import { ActionNameEnum } from "@app/types/enums";

@Entity("activities")
export class Activity extends BaseEntity implements IActivity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "profile_id", type: "uuid", nullable: false })
  profileId: string;

  @Column({ name: "action_id", type: "number", nullable: false })
  actionId: number;

  @Column({ name: "finished_at", type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
  finishedAt: Date;

  // Relations
  @ManyToOne(() => LearnerProfile, (profile) => profile.id)
  @JoinColumn({ name: "profile_id", referencedColumnName: "id" })
  profile: LearnerProfile;

  @ManyToOne(() => Action, (action) => action.id)
  @JoinColumn({ name: "action_id", referencedColumnName: "id" })
  action: Action;

  // Active Record Pattern
  static async getBonusStreakPoint(learnerProfileId: string) {
    const action = await Action.findByName(ActionNameEnum.DAILY_STREAK);

    return this.createQueryBuilder("activity")
      .where("activity.profileId = :profileId", { profileId: learnerProfileId })
      .andWhere("activity.actionId = :actionId", { actionId: action.id })
      .andWhere("DATE(activity.finishedAt) = CURRENT_DATE")
      .getCount();
  }
}
