import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Athlete } from "./Athlete";

@Entity("videos")
export class Video extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Relationship to Athlete
  @Column("uuid")
  athleteId: string;

  @ManyToOne(() => Athlete, (athlete) => athlete.videos)
  athlete: Athlete;

  // Video Information
  @Column("text")
  videoUrl: string; // URL to video (YouTube, Vimeo, Hudl, or uploaded file)

  @Column("varchar", { length: 255, nullable: true })
  title: string | null;

  @Column("text", { nullable: true })
  description: string | null;

  @Column("varchar", { length: 50, nullable: true })
  videoType: string | null; // "highlight", "training", "interview", "game"

  @CreateDateColumn()
  createdAt: Date;
}
