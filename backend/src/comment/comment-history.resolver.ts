import { Arg, Query, Resolver } from "type-graphql/dist";
import { CommentEditHistory } from "../entity/comment-edit-history";

@Resolver(CommentEditHistory)
export class CommentEditHistoryResolver {
  @Query(() => [CommentEditHistory], { nullable: true })
  async commentEditHistory(
    @Arg("id") id: string
  ): Promise<CommentEditHistory[] | undefined> {
    return CommentEditHistory.find<CommentEditHistory>({
      where: { commentId: id },
      order: { modifiedOn: "DESC" }
    });
  }
}
