import { Service } from "typedi";
import { User } from "../entity/user";
import { filterDeleted } from "../comment/comments.resolver";

@Service()
export class UserService {
  public async getUser(userId: string): Promise<User | undefined> {
    if (userId === "-1") {
      return Promise.resolve(getAnonymousUser());
    } else {
      return User.findOne<User>(filterDeleted({ where: { id: userId } }));
    }
  }
}

function getAnonymousUser(): User {
  return {
    id: "-1",
    name: "Anonymous user",
    userId: "anonymous",
    active: true,
    email: ""
  } as User;
}
