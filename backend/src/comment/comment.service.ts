import { Service } from "typedi";
import { User } from "../entity/user";
import { filterDeleted } from "./comments.resolver";

@Service()
export class CommentService {
  public async getUser(userId: string): Promise<User | undefined> {
    if (userId === "-1") {
      return Promise.resolve({
        id: userId,
        name: "Anonymous user",
        userId: "anonymous",
        active: true,
        email: ""
      } as User);
    } else {
      return User.findOne<User>(filterDeleted({ where: { id: userId } }));
    }
  }
}
