import { Query, Resolver, Ctx } from "type-graphql/dist";
import {EntityManager, TransactionManager} from "typeorm";
import {DistributedTransaction} from "../common/decorator/distributed-transaction";
import { User } from "../entity/user";
import { AppContext } from "../common/types/context";

@Resolver(User)
export class MeResolver {
  @DistributedTransaction()
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: AppContext,
           @TransactionManager() manager: EntityManager): Promise<User | undefined | null> {
    const id = ctx.req.session!.userId;
    if (!id) {
      return null;
    }
    console.log('*', manager);
    return User.findOne<User>({ where: { id } });
  }
}
