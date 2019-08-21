import { Field, InputType } from "type-graphql";

@InputType()
export class CreateCommentInputType {
  @Field({ defaultValue: "-1" })
  parentId: string;

  @Field()
  content: string;
}
