import { ContentTypeEnum, LevelEnum } from "@app/types/enums";
import { IQuestion } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { QuestionToLesson } from "./question-to-lesson.entity";
import { Bucket } from "./bucket.entity";

@Entity({ name: "questions" })
export class Question extends BaseEntity implements IQuestion {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "content_type", type: "enum", enum: ContentTypeEnum, nullable: false })
  contentType: ContentTypeEnum;

  @Column({ name: "content_id", type: "uuid", nullable: false })
  contentId: string;

  @Column({ name: "image_id", type: "uuid", nullable: true })
  imageId: string;

  @Column({ name: "audio_id", type: "uuid", nullable: true })
  audioId: string;

  @Column({ name: "level", type: "enum", enum: LevelEnum, nullable: false })
  level: LevelEnum;

  @Column({ name: "explanation", type: "text", nullable: false })
  explanation: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @OneToMany(() => QuestionToLesson, (questionToLesson) => questionToLesson.question)
  readonly questionToLessons: QuestionToLesson[];

  @ManyToOne(() => Bucket, (bucket) => bucket.id)
  readonly image: Bucket;

  @ManyToOne(() => Bucket, (bucket) => bucket.id)
  readonly audio: Bucket;
}
