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
import { Length } from "class-validator";

@ObjectType()
@Entity({ database: "livecommenttestdb" })
export class CommentTest extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column("text")
  @Length(1, 5)
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
  @Column({ default: false })
  isDeleted: boolean;

  @Field()
  @Column({ default: "-1" })
  parentId: string;
}
