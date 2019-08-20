import { Query, Resolver, Ctx } from "type-graphql/dist";
import { User } from "../entity/user";
import { AppContext } from "../common/types/context";

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
}
