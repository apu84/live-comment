import { Ctx, Mutation, Resolver } from "type-graphql/dist";
import { AppContext } from "../common/types/context";
import { User } from "../entity/user";

@Resolver(User)
export class LoginResolver {
  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: AppContext): Promise<boolean> {
    return new Promise((resolve, reject) => {
      ctx.req.session!.destroy(err => {
        if (err) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
