import { Field, InputType } from "type-graphql";
import { IfMatch } from "../common/validators/version.validator";
import { Comment } from "../entity/comment";

@InputType()
export class CommentInputType {
  @Field()
  id: string;

  @Field()
  content: string;

  @Field()
  @IfMatch({ context: { entity: Comment, entityIdPropertyName: "id" } })
  version: number;
}
