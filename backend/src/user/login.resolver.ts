import { Arg, Mutation, Resolver, Ctx } from "type-graphql/dist";
import { User } from "../entity/user";
import bcrypt from "bcryptjs";
import { AppContext } from "../common/types/context";

@Resolver(User)
export class LoginResolver {
  @Mutation(() => Boolean)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: AppContext
  ): Promise<boolean> {
    const user = await User.findOne<User>({ where: { email } });
    if (!user) {
      return false;
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return false;
    }

    ctx.req.session!.userId = user.id;
    return true;
  }
}
