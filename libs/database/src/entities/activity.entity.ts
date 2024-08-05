import { IActivity } from "@app/types/interfaces";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LearnerProfile } from "./learner-profile.entity";
import { Action } from "./action.entity";

@Entity("activities")
export class Activity extends BaseEntity implements IActivity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "profile_id", type: "uuid", nullable: false })
  profileId: string;

  @Column({ name: "action_id", type: "number", nullable: false })
  actionId: number;

  @Column({ name: "finished_on", type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
  finishedOn: Date;

  // Relations
  @ManyToOne(() => LearnerProfile, (profile) => profile.id)
  @JoinColumn({ name: "profile_id", referencedColumnName: "id" })
  profile: LearnerProfile;

  @ManyToOne(() => Action, (action) => action.id)
  @JoinColumn({ name: "action_id", referencedColumnName: "id" })
  action: Action;
}
