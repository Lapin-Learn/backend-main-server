import { IMultipleChoice } from "@app/types/interfaces";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "multiple_choices" })
export class MultipleChoice extends BaseEntity implements IMultipleChoice {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "text", type: "text", nullable: false })
  text: string;

  @Column({ name: "choices", type: "text", array: true, nullable: false })
  choices: string[];

  @Column({ name: "correct_answer", type: "int", nullable: false })
  correctAnswer: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
