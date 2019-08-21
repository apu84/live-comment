import { Field, ObjectType } from "type-graphql/dist";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({ nullable: false })
  userId: string;

  @Field()
  @Column({ nullable: false })
  name: string;

  @Field()
  @Column("boolean", { default: true })
  active: boolean;

  @Column({ nullable: false })
  password: string;

  @Field()
  @Column("text", { unique: true, nullable: false })
  email: string;
}
