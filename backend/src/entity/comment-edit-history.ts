import { Field, ObjectType } from "type-graphql/dist";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from "typeorm";

@ObjectType()
@Entity()
export class CommentEditHistory extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  commentId: string;

  @Field()
  @Column("text")
  content: string;

  @Field()
  @CreateDateColumn()
  modifiedOn: Date;

  @Field()
  @Column({ default: false })
  isDeleted: boolean;
}
