import { Query, Resolver, Ctx, Mutation } from "type-graphql/dist";
import { TransactionManager } from "typeorm";
import { DistributedTransaction } from "../common/decorator/distributed-transaction";
import { User } from "../entity/user";
import { AppContext } from "../common/types/context";
import { DistributedEntityManager } from "../common/decorator/distributed-entitity-manager";
import { CommentTest } from "../entity/commenttest";
import { CurrentUser } from "./current-user.decorator";

@Resolver(User)
export class MeResolver {
  @Query(() => User, { nullable: true })
  async me(@CurrentUser() user: User): Promise<User | undefined | null> {
    return user;
  }

  @DistributedTransaction()
  @Mutation(() => User, { nullable: true })
  async transactionTest(
    @CurrentUser() user: User,
    @TransactionManager() manager: DistributedEntityManager
  ): Promise<User | undefined | null> {
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
