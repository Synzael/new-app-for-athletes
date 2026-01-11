import * as bcrypt from "bcryptjs";
import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToMany,
  OneToOne
} from "typeorm";
import { Listing } from "./Listing";
import { Athlete } from "./Athlete";

export enum UserRole {
  ATHLETE = "athlete",
  COACH = "coach",
  BRAND = "brand",
  ADMIN = "admin"
}

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;

  @Column("varchar", { length: 255 })
  email: string;

  @Column("text") password: string;

  @Column("boolean", { default: false })
  confirmed: boolean;

  @Column("boolean", { default: false })
  forgotPasswordLocked: boolean;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.ATHLETE
  })
  role: UserRole;

  @OneToMany(() => Listing, listing => listing.user)
  listings: Listing[];

  @OneToOne(() => Athlete, athlete => athlete.user)
  athlete: Athlete;

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
