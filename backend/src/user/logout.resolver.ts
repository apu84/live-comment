import { Ctx, Mutation, Resolver } from "type-graphql/dist";
import { AppContext } from "../common/types/context";
import { User } from "../entity/user";
import { cookieId } from "../common/user-session";

@Resolver(User)
export class LoginResolver {
  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: AppContext): Promise<boolean> {
    return new Promise((resolve, reject) => {
      ctx.req.session!.destroy(err => {
        if (err) {
          reject(false);
        } else {
          ctx.res.clearCookie(cookieId);
          resolve(true);
        }
      });
    });
  }
}
