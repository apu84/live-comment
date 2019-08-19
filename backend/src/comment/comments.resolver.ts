import {
  Resolver,
  Query,
  Mutation,
  Arg,
  FieldResolver,
  Root
} from "type-graphql/dist";
import { Comment } from "../entity/comment";
import { User } from "../entity/user";

@Resolver(Comment)
export class CommentsResolver {
  @Query(() => String)
  async hello() {
    return "hello-world";
  }

  @FieldResolver()
  async user(@Root() parent: Comment) {
    return User.findOne({ where: { id: parent.userId } });
  }

  @Mutation(() => Comment)
  async addComment(
    @Arg("content") content: string,
    @Arg("userId") userId: string
  ): Promise<Comment> {
    const comment = Comment.create<Comment>({
      content,
      userId
    }).save();

    return comment;
  }
}
