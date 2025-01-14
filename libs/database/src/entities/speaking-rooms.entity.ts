import { ISpeakingRoom, ISpeakingRoomContent } from "@app/types/interfaces";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("speaking_rooms")
export class SpeakingRoom extends BaseEntity implements ISpeakingRoom {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "content", type: "jsonb", nullable: true })
  content: ISpeakingRoomContent;

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
}
