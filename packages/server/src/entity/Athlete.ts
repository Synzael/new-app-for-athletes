import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { PerformanceStat } from "./PerformanceStat";
import { Video } from "./Video";

@Entity("athletes")
export class Athlete extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Relationship to User
  @Column("uuid")
  userId: string;

  @ManyToOne(() => User, (user) => user.athlete)
  user: User;

  // Profile Information
  @Column("varchar", { length: 100 })
  firstName: string;

  @Column("varchar", { length: 100 })
  lastName: string;

  @Column("date", { nullable: true })
  dateOfBirth: Date | null;

  @Column("text", { nullable: true })
  bio: string | null;

  @Column("text", { nullable: true })
  profilePictureUrl: string | null;

  @Column("varchar", { length: 100, nullable: true })
  hometown: string | null;

  @Column("varchar", { length: 100, nullable: true })
  highSchool: string | null;

  @Column("varchar", { length: 100, nullable: true })
  college: string | null;

  @Column("int", { nullable: true })
  graduationYear: number | null;

  // Sports Information
  @Column("varchar", { length: 50 })
  primarySport: string;

  @Column("text", { array: true, default: "{}" })
  positions: string[];

  @Column("varchar", { length: 50, nullable: true })
  heightFeet: string | null; // e.g., "6'2"

  @Column("int", { nullable: true })
  weight: number | null;

  // Contact/Social
  @Column("varchar", { length: 100, nullable: true })
  phoneNumber: string | null;

  @Column("text", { array: true, default: "{}" })
  socialMediaLinks: string[];

  // Rating Components (0-100 scale)
  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  performanceScore: number;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  physicalScore: number;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  academicScore: number;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  socialScore: number;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  evaluationScore: number;

  // Calculated Star Rating (1-5)
  @Column("decimal", { precision: 3, scale: 2, default: 0 })
  starRating: number;

  // Metadata
  @Column("boolean", { default: true })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => PerformanceStat, (stat) => stat.athlete)
  performanceStats: PerformanceStat[];

  @OneToMany(() => Video, (video) => video.athlete)
  videos: Video[];
}
