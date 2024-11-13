import { ILevel } from "@app/types/interfaces";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { LearnerProfile } from "./learner-profile.entity";

@Entity("levels")
export class Level extends BaseEntity implements ILevel {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "xp", type: "int", nullable: false, default: 0 })
  xp: number;

  @OneToMany(() => LearnerProfile, (learnerProfile) => learnerProfile.levelId)
  readonly learners: LearnerProfile[];
}
