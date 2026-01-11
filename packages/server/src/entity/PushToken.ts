import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  BaseEntity,
  Index,
} from "typeorm";
import { User } from "./User";

@Entity("push_tokens")
@Index(["userId", "token"], { unique: true })
export class PushToken extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Column("varchar", { length: 255 })
  token: string;

  @Column("varchar", { length: 20 })
  platform: "ios" | "android" | "web";

  @Column("boolean", { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
