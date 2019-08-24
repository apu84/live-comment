import { Query, Resolver, Ctx, Mutation } from "type-graphql/dist";
import { TransactionManager } from "typeorm";
import { DistributedTransaction } from "../common/decorator/distributed-transaction";
import { User } from "../entity/user";
import { AppContext } from "../common/types/context";
import { DistributedEntityManager } from "../common/decorator/distributed-entitity-manager";
import { CommentTest } from "../entity/commenttest";

@Resolver(User)
export class MeResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: AppContext): Promise<User | undefined | null> {
    const id = ctx.req.session!.userId;
    if (!id) {
      return null;
    }
    return User.findOne<User>({ where: { id } });
  }

  @DistributedTransaction()
  @Mutation(() => User, { nullable: true })
  async transactionTest(
    @Ctx() ctx: AppContext,
    @TransactionManager() manager: DistributedEntityManager
  ): Promise<User | undefined | null> {
    const id = ctx.req.session!.userId;
    if (!id) {
      return null;
    }
    const user = await User.findOne<User>({ where: { id } });
    if (user) {
      user.active = !user.active;
      await manager.save(User, user);

      const testComment = CommentTest.create({
        content: "This is a comment " + new Date(),
        userId: user.id
      });
      await manager.save(CommentTest, testComment);
      throw new Error("Error in transaction");
    }
    return user;
  }
}
