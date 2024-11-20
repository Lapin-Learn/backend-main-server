import { IStreak } from "@app/types/interfaces";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("streaks")
export class Streak extends BaseEntity implements IStreak {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "current", type: "int", nullable: false, default: 0 })
  current: number;

  /**
   * Current streak is extended on yesterday or not
   * @default false
   * @type {boolean}
   * - if true, it means user has completed the streak for the day
   * and the streak is extended to the next day
   * - if false, it means user has not completed the streak for the day
   * and the streak may be reset to 0 when running cron job
   */
  @Column({ name: "extended", type: "boolean", nullable: false, default: false })
  extended: boolean;

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

  public async increaseStreak() {
    if (this.extended) {
      this.current += 1; // If yesterday streak is extended, increase current value
    } else this.current = 1; // If yesterday streak is not extended, reset current value to 1

    if (this.current > this.record) {
      this.record = this.current;
    }
    this.extended = true; // Mark today streak as extended
    await this.save();
  }
}
