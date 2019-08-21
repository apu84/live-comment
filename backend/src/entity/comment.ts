import {
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  Entity
} from "typeorm";
import { ObjectType, Field } from "type-graphql/dist";
import { User } from "./user";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column("text")
  content: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @CreateDateColumn()
  creationDate: Date;

  @Field()
  @UpdateDateColumn()
  lastModifiedDate: Date;

  @Field()
  @VersionColumn()
  version: number;

  @Field()
  user: User;

  @Field()
  @Column({ default: false })
  isDeleted: boolean;
}
