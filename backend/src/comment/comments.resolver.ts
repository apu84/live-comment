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

  @Query(() => [Comment])
  async comments(): Promise<Comment[]> {
    return Comment.find();
  }

  @Query(() => Comment, { nullable: true })
  async comment(@Arg("id") id: string): Promise<Comment | undefined> {
    return Comment.findOne({ where: { id } });
  }

  @Query(() => [Comment])
  async commentsByUser(
    @Arg("userId") userId: string,
    @Arg("take", { defaultValue: 10 }) take: number
  ): Promise<Comment[] | undefined> {
    return Comment.find({
      where: { userId },
      take,
      order: { creationDate: "DESC" }
    });
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
