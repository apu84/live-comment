import {
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  Entity
} from "typeorm";

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text")
  content: string;

  @Column()
  userId: string;

  @CreateDateColumn()
  creationDate: string;

  @UpdateDateColumn()
  lastModifiedDate: string;

  @VersionColumn()
  version: number;
}
