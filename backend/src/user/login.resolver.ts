import { Arg, Mutation, Resolver, Ctx } from "type-graphql/dist";
import { User } from "../entity/user";
import bcrypt from "bcryptjs";
import { AppContext } from "../common/types/context";

@Resolver(User)
export class LoginResolver {
  @Mutation(() => User, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: AppContext
  ): Promise<User | null> {
    const user = await User.findOne<User>({ where: { email } });
    if (!user) {
      return null;
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return null;
    }

    ctx.req.session!.userId = user.id;
    return user;
  }
}
