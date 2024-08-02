import { IBadge } from "@app/types/interfaces";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Action } from "./action.entity";

@Entity({ name: "badges" })
export class Badge extends BaseEntity implements IBadge {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: "name", type: "varchar", nullable: false })
  name: string;

  @Column({ name: "description", type: "text", nullable: false })
  description: string;

  @Column({ name: "requirements", type: "int", nullable: false })
  requirements: number;

  @OneToOne(() => Action)
  @JoinColumn({ name: "action_id", referencedColumnName: "id" })
  actionId: Action;
}
