import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ObjectType, Field } from "type-graphql/dist";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column("boolean")
  active: boolean;
}
