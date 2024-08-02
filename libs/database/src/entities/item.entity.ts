import { IItem } from "@app/types/interfaces";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "items" })
export class Item extends BaseEntity implements IItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "description", type: "text", nullable: false })
  description: string;

  @Column({ name: "price", type: "int", nullable: false })
  price: number;

  @Column({ name: "duration", type: "int", nullable: false })
  duration: number;
}
