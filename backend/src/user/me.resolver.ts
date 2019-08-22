import { Query, Resolver, Ctx } from "type-graphql/dist";
import { TransactionManager } from "typeorm";
import { DistributedTransaction } from "../common/decorator/distributed-transaction";
import { User } from "../entity/user";
import { AppContext } from "../common/types/context";
import { DistributedEntityManager } from "../common/decorator/distributed-entitity-manager";
import { CommentTest } from "../entity/commenttest";

@Resolver(User)
export class MeResolver {
  @DistributedTransaction()
  @Query(() => User, { nullable: true })
  async me(
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
      await manager.saveEntity(User, user);

      const testComment = CommentTest.create({
        content: "This is a comment " + new Date(),
        userId: user.id
      });
      await manager.saveEntity(CommentTest, testComment);
    }
    return user;
  }
}
