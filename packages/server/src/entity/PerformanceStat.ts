import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Athlete } from "./Athlete";

@Entity("performance_stats")
export class PerformanceStat extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Relationship to Athlete
  @Column("uuid")
  athleteId: string;

  @ManyToOne(() => Athlete, (athlete) => athlete.performanceStats)
  athlete: Athlete;

  // Stat Information
  @Column("varchar", { length: 100 })
  statName: string; // e.g., "40-yard dash", "Vertical Jump", "Bench Press"

  @Column("varchar", { length: 50 })
  statValue: string; // e.g., "4.5", "35", "225"

  @Column("varchar", { length: 50, nullable: true })
  unit: string | null; // e.g., "seconds", "inches", "lbs"

  @Column("date", { nullable: true })
  recordedDate: Date | null;

  @Column("varchar", { length: 100, nullable: true })
  eventName: string | null; // e.g., "Nike Camp 2024", "State Championship Combine"

  @CreateDateColumn()
  createdAt: Date;
}
