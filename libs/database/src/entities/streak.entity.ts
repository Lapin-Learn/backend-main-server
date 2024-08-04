import { IStreak } from "@app/types/interfaces";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("streaks")
export class Streak extends BaseEntity implements IStreak {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "current", type: "int", nullable: false, default: 0 })
  current: number;

  @Column({ name: "target", type: "int", nullable: false, default: 0 })
  target: number;

  @Column({ name: "record", type: "int", nullable: false, default: 0 })
  record: number;
}
