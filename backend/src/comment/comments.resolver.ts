import {
  Resolver,
  Query,
  Mutation,
  Arg,
  FieldResolver,
  Root
} from "type-graphql/dist";
import { Comment } from "../entity/comment";
import { users } from "../user/dummy-users";

@Resolver(Comment)
export class CommentsResolver {
  @Query(() => String)
  async hello() {
    return "hello-world";
  }

  @FieldResolver()
  async user(@Root() parent: Comment) {
    return users.filter(user => user.id === parent.userId).pop();
  }

  @Mutation(() => Comment)
  async addComment(
    @Arg("content") content: string,
    @Arg("userId") userId: string
  ): Promise<Comment> {
    const comment = Comment.create({
      content,
      userId
    }).save();

    return comment;
  }
}
