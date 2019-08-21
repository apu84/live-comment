import { MiddlewareFn } from "type-graphql";
import { AppContext } from "../types/context";
import { Comment } from "../../entity/comment";

export const isAuthorized: MiddlewareFn<AppContext> = async (
  { context, args },
  next
) => {
  const userId = context.req.session!.userId;
  if (!userId) {
    throw new Error("Not authenticated");
  }
  const commentId = args.data ? args.data.id : args.id;
  if (commentId) {
    const comment = await Comment.findOne<Comment>({
      where: { id: commentId }
    });
    if (comment && comment.userId !== userId) {
      throw new Error("Not authorized");
    }
  }
  return next();
};
