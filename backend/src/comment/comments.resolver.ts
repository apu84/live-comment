import { Resolver, Query, Mutation, Arg } from "type-graphql/dist";
import { Comment } from "../entity/comment";

@Resolver()
export class CommentsResolver {
  @Query(() => String)
  async hello() {
    return "hello-world";
  }

  @Mutation(() => Comment)
  async addComment(
    @Arg("content") content: string,
    @Arg("userId") userId: string
  ) {
    const comment = Comment.create({
      content,
      userId
    }).save();

    return comment;
  }
}
