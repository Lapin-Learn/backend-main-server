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
import { Bucket } from "./bucket.entity";
import { QuestionType } from "./question-type.entity";

@Entity({ name: "instructions" })
export class Instruction extends BaseEntity implements IInstruction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "content", type: "text", nullable: false })
  content: string;

  @Column({ name: "image_id", type: "uuid", nullable: true })
  imageId: string;

  @Column({ name: "audio_id", type: "uuid", nullable: true })
  audioId: string;

  @Column({ name: "question_type_id", type: "int", nullable: false })
  questionTypeId: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(() => QuestionType, (questionType) => questionType.instructions)
  @JoinColumn({ name: "question_type_id", referencedColumnName: "id" })
  readonly questionType: QuestionType;

  @ManyToOne(() => Bucket, (bucket) => bucket.id)
  @JoinColumn({ name: "image_id", referencedColumnName: "id" })
  readonly image: Bucket;

  @ManyToOne(() => Bucket, (bucket) => bucket.id)
  @JoinColumn({ name: "audio_id", referencedColumnName: "id" })
  readonly audio: Bucket;
}
