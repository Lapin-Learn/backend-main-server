import { IProfileBadge } from "@app/types/interfaces";
import { BaseEntity, Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LearnerProfile } from "./learner-profile.entity";
import { Badge } from "./badge.entity";

export class ProfileBadge extends BaseEntity implements IProfileBadge {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "profile_id", type: "uuid", nullable: false })
  profileId: string;

  @Column({ name: "badge_id", type: "uuid", nullable: false })
  badgeId: string;

  // Relations
  @ManyToOne(() => LearnerProfile, (profile) => profile.id)
  @JoinColumn({ name: "profile_id", referencedColumnName: "id" })
  profile: LearnerProfile;

  @ManyToOne(() => Badge, (badge) => badge.id)
  @JoinColumn({ name: "badge_id", referencedColumnName: "id" })
  badge: Badge;
}
