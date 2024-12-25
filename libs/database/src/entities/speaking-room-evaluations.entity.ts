import { ISpeakingRoomEvaluation } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { SpeakingRoom } from "./speaking-rooms.entity";
import { LearnerProfile } from "./learner-profile.entity";

@Entity("speaking_room_evaluations")
export class SpeakingRoomEvaluation extends BaseEntity implements ISpeakingRoomEvaluation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "speaking_room_id", type: "uuid", nullable: false })
  speakingRoomId: string;

  @Column({ name: "profile_id", type: "uuid", nullable: false })
  profileId: string;

  @Column({ name: "part1", type: "jsonb", nullable: true, default: {} })
  part1: object;

  @Column({ name: "part2", type: "jsonb", nullable: true, default: {} })
  part2: object;

  @Column({ name: "part3", type: "jsonb", nullable: true, default: {} })
  part3: object;

  @Column({ name: "overall", type: "jsonb", nullable: true, default: {} })
  overall: object;

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
  @ManyToOne(() => SpeakingRoom, (speakingRoom) => speakingRoom.id)
  @JoinColumn({ name: "speaking_room_id", referencedColumnName: "id" })
  speakingRoom: SpeakingRoom;

  @ManyToOne(() => LearnerProfile, (profile) => profile.id)
  @JoinColumn({ name: "profile_id", referencedColumnName: "id" })
  profile: LearnerProfile;
}
