import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware
} from "type-graphql/dist";
import { FindManyOptions } from "typeorm";
import { isAuthenticated } from "../common/middleware/authenticated";
import { isAuthorized } from "../common/middleware/authorized";
import { AppContext } from "../common/types/context";
import { Comment } from "../entity/comment";
import { User } from "../entity/user";
import { CommentInputType } from "./comment.input";

function filterDeleted<T>(
  condition: FindManyOptions<T>,
  deleted: boolean = false
) {
  if (!condition.where) {
    condition.where = {};
  }
  Object.assign(condition.where, { isDeleted: deleted });
  return condition;
}

@Resolver(Comment)
export class CommentsResolver {
  @Query(() => String)
  async hello() {
    return "hello-world";
  }

  @Query(() => [Comment])
  async comments(): Promise<Comment[]> {
    return Comment.find<Comment>(filterDeleted({}));
  }

  @Query(() => Comment, { nullable: true })
  async comment(@Arg("id") id: string): Promise<Comment | undefined> {
    return Comment.findOne<Comment>(filterDeleted({ where: { id } }));
  }

  @Query(() => [Comment])
  async commentsByUser(
    @Arg("userId") userId: string,
    @Arg("take", { defaultValue: 10 }) take: number
  ): Promise<Comment[] | undefined> {
    return Comment.find<Comment>(
      filterDeleted<Comment>({
        where: { userId },
        take,
        order: { creationDate: "DESC" }
      })
    );
  }

  @FieldResolver()
  async user(@Root() parent: Comment) {
    return User.findOne<Comment>(
      filterDeleted({ where: { id: parent.userId } })
    );
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Comment)
  async addComment(
    @Arg("content") content: string,
    @Ctx() ctx: AppContext
  ): Promise<Comment> {
    const userId = ctx.req.session!.userId;
    const comment = Comment.create<Comment>({
      content,
      userId
    }).save();

    return comment;
  }

  @UseMiddleware(isAuthenticated, isAuthorized)
  @Mutation(() => Comment, { nullable: true })
  async editComment(
    @Arg("data") data: CommentInputType
  ): Promise<Comment | undefined> {
    const comment = await Comment.findOne<Comment>(
      filterDeleted<Comment>({ where: { id: data.id } })
    );
    if (comment) {
      comment.content = data.content;
      await comment.save();
    }
    return comment;
  }

  @UseMiddleware(isAuthenticated, isAuthorized)
  @Mutation(() => Comment, { nullable: true })
  async deleteComment(@Arg("id") id: string): Promise<Comment | undefined> {
    const comment = await Comment.findOne<Comment>(
      filterDeleted({ where: { id } })
    );
    if (comment) {
      comment.isDeleted = true;
      await comment.save();
    }
    return comment;
  }
}
