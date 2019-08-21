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
import { Container } from "typedi";
import {
  EntityManager,
  FindManyOptions,
  Transaction,
  TransactionManager
} from "typeorm";
import { isAuthenticated } from "../common/middleware/authenticated";
import { isAuthorized } from "../common/middleware/authorized";
import { AppContext } from "../common/types/context";
import { Comment } from "../entity/comment";
import { CommentEditHistory } from "../entity/comment-edit-history";
import { User } from "../entity/user";
import { CommentService } from "./comment.service";
import { CreateCommentInputType } from "./create.comment.input";
import { EditCommentInputType } from "./edit.comment.input";

export function filterDeleted<T>(
  condition: FindManyOptions<T>,
  deleted: boolean = false
): FindManyOptions<T> {
  if (!condition.where) {
    condition.where = {};
  }
  Object.assign(condition.where, { isDeleted: deleted });
  return condition;
}

@Resolver(Comment)
export class CommentsResolver {
  private commentService: CommentService;

  constructor() {
    this.commentService = Container.get(CommentService);
  }
  @Query(() => String)
  async ping() {
    return "pong";
  }

  @Query(() => [Comment])
  async comments(
    @Arg("parentId", { defaultValue: "-1" }) parentId?: string
  ): Promise<Comment[]> {
    return Comment.find<Comment>(filterDeleted({ where: { parentId } }));
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

  @FieldResolver(() => User)
  async user(@Root() parent: Comment) {
    return this.commentService.getUser(parent.userId);
  }

  @UseMiddleware(isAuthenticated)
  @Mutation(() => Comment)
  async addComment(
    @Arg("data") data: CreateCommentInputType,
    @Ctx() ctx: AppContext
  ): Promise<Comment> {
    const userId = ctx.req.session!.userId;
    const comment = Comment.create<Comment>({
      content: data.content,
      userId,
      parentId: data.parentId
    }).save();

    return comment;
  }

  @Transaction()
  @UseMiddleware(isAuthenticated, isAuthorized)
  @Mutation(() => Comment, { nullable: true })
  async editComment(
    @Arg("data") data: EditCommentInputType,
    @TransactionManager() manager: EntityManager
  ): Promise<Comment | undefined> {
    let comment = await Comment.findOne<Comment>(
      filterDeleted<Comment>({ where: { id: data.id } })
    );
    if (comment) {
      const history = CommentEditHistory.create<CommentEditHistory>({
        commentId: comment.id,
        content: comment.content
      });
      await manager.save(history);
      comment.content = data.content;
      comment = await manager.save(comment);
    }
    return comment;
  }

  @Transaction()
  @UseMiddleware(isAuthenticated, isAuthorized)
  @Mutation(() => Comment, { nullable: true })
  async deleteComment(
    @Arg("id") id: string,
    @TransactionManager() manager: EntityManager
  ): Promise<Comment | undefined> {
    const comment = await Comment.findOne<Comment>(
      filterDeleted({ where: { id } })
    );
    if (comment) {
      const replyCount = await Comment.count<Comment>(
        filterDeleted<Comment>({
          where: { parentId: comment.id }
        })
      );
      if (replyCount > 0) {
        throw new Error(
          `Can not remove comment, as it has ${replyCount} or more replies`
        );
      }
      const history = CommentEditHistory.create<CommentEditHistory>({
        commentId: comment.id,
        content: comment.content,
        isDeleted: true
      });
      await manager.save(history);

      comment.isDeleted = true;
      await manager.save(comment);
    }
    return comment;
  }

  @FieldResolver(() => [Comment], { nullable: true })
  async replies(
    @Root() parent: Comment,
    @Arg("take", { defaultValue: 10 }) take: number
  ): Promise<Comment[] | undefined> {
    return Comment.find<Comment>(
      filterDeleted<Comment>({
        where: { parentId: parent.id },
        take,
        order: { creationDate: "DESC" }
      })
    );
  }
}
