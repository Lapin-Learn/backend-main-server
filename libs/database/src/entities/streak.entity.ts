import { IStreak } from "@app/types/interfaces";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
