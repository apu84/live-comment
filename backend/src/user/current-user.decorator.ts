import { AppContext } from "../common/types/context";
import { createParamDecorator } from "type-graphql/dist/decorators/createParamDecorator";
import { User } from "../entity/user";

export function CurrentUser(): ParameterDecorator {
  return createParamDecorator<AppContext>(({ context }) => {
    const id = context.req.session!.userId;
    if (!id) {
      return null;
    }
    return User.findOne<User>({ where: { id } });
  });
}
