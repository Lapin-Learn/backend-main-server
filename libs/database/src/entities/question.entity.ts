import { ContentTypeEnum, CERFLevelEum } from "@app/types/enums";
import { IListQuestion, IQuestion } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { QuestionToLesson } from "./question-to-lesson.entity";
import { Bucket } from "./bucket.entity";
import { QueryParamQuestionDto } from "@app/types/dtos/admin";
import _ from "lodash";

@Entity({ name: "questions" })
export class Question extends BaseEntity implements IQuestion {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "content_type", type: "enum", enum: ContentTypeEnum, nullable: false })
  contentType: ContentTypeEnum;

  @Column({ name: "content", type: "jsonb", nullable: false })
  content: object;

  @Column({ name: "image_id", type: "uuid", nullable: true })
  imageId: string;

  @Column({ name: "audio_id", type: "uuid", nullable: true })
  audioId: string;

  @Column({ name: "cerf_level", type: "enum", enum: CERFLevelEum, nullable: false })
  cerfLevel: CERFLevelEum;

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

  @OneToOne(() => Bucket, (bucket) => bucket.id)
  @JoinColumn({ name: "image_id" })
  readonly image: Bucket;

  @OneToOne(() => Bucket, (bucket) => bucket.id)
  @JoinColumn({ name: "audio_id" })
  readonly audio: Bucket;

  static async getQuestionsWithParams(param: QueryParamQuestionDto): Promise<IListQuestion> {
    const { listContentTypes, cerfLevel, offset, limit } = param;

    const query = this.createQueryBuilder("question")
      .leftJoinAndSelect("question.image", "image")
      .leftJoinAndSelect("question.audio", "audio");

    !_.isNil(listContentTypes) && query.where("question.contentType IN (:...listContentTypes)", { listContentTypes });
    !_.isNil(cerfLevel) && query.andWhere("question.cerfLevel = :cerfLevel", { cerfLevel });

    const listQuestions = await query.skip(offset).take(limit).getManyAndCount();

    return {
      questions: listQuestions[0],
      offset,
      limit,
      total: listQuestions[1],
    };
  }
}
