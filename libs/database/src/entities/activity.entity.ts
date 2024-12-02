import { IActivity } from "@app/types/interfaces";
import { BaseEntity, Between, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LearnerProfile } from "./learner-profile.entity";
import { Action } from "./action.entity";
import { ActionNameEnum } from "@app/types/enums";
import { getBeginOfOffsetDay, getEndOfOffsetDay } from "@app/utils/time";

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
  static async getBonusStreakPoint(learnerProfileId: string, begin?: Date, end?: Date) {
    const action = await Action.findByName(ActionNameEnum.DAILY_STREAK);

    const beginOfDay = begin ?? getBeginOfOffsetDay();
    const endOfDay = end ?? getEndOfOffsetDay();

    const activity = await Activity.findOne({
      where: {
        profileId: learnerProfileId,
        actionId: action.id,
        finishedAt: Between(beginOfDay, endOfDay),
      },
    });

    return activity ? 0 : 1;
  }
}
