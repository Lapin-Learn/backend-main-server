import { IInstruction } from "@app/types/interfaces";
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
import { Lesson } from "./lesson.entity";
import { Bucket } from "./bucket.entity";

@Entity({ name: "instructions" })
export class Instruction extends BaseEntity implements IInstruction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "content", type: "text", nullable: false })
  content: string;

  @Column({ name: "order", type: "int", nullable: false, default: 0 })
  order: number;

  @Column({ name: "image_id", type: "uuid", nullable: true })
  imageId: string;

  @Column({ name: "audio_id", type: "uuid", nullable: true })
  audioId: string;

  @Column({ name: "lesson_id", type: "int", nullable: false })
  lessonId: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(() => Lesson, (lesson) => lesson.instructions)
  @JoinColumn({ name: "lesson_id", referencedColumnName: "id" })
  readonly lesson: Lesson;

  @ManyToOne(() => Bucket, (bucket) => bucket.id)
  @JoinColumn({ name: "image_id", referencedColumnName: "id" })
  readonly image: Bucket;

  @ManyToOne(() => Bucket, (bucket) => bucket.id)
  @JoinColumn({ name: "audio_id", referencedColumnName: "id" })
  readonly audio: Bucket;
}
