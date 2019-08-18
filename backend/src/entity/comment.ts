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
import { User } from "../user/user";

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
  creationDate: string;

  @Field()
  @UpdateDateColumn()
  lastModifiedDate: string;

  @Field()
  @VersionColumn()
  version: number;

  @Field()
  user: User;
}
