import { ISpeakingRoom, ISpeakingRoomEvaluation } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { SpeakingRoomEvaluation } from "./speaking-room-evaluations.entity";

@Entity("speaking_rooms")
export class SpeakingRoom extends BaseEntity implements ISpeakingRoom {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "content", type: "jsonb", nullable: true })
  content: object;

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
  @OneToMany(() => SpeakingRoomEvaluation, (evaluation) => evaluation.speakingRoom)
  speakingRoomEvaluations: ISpeakingRoomEvaluation[];
}
