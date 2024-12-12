import { VN_TIME_ZONE } from "@app/types/constants";
import { IStreak } from "@app/types/interfaces";
import moment from "moment-timezone";
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

  @Column({ name: "last_date_gain_new_streak", type: "timestamp", nullable: false })
  lastDateGainNewStreak: Date;

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
    this.current += 1;
    if (this.current > this.record) {
      this.record = this.current;
    }
    this.extended = true; // Mark today streak as extended
    this.lastDateGainNewStreak = moment().tz(VN_TIME_ZONE).toDate();
    await this.save();
  }
}
