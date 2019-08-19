import { Arg, FieldResolver, Mutation, Resolver, Root } from "type-graphql";
import { User } from "../entity/user";
import { Comment } from "../entity/comment";
import bcrypt from "bcryptjs";

@Resolver(User)
export class UsersResolver {
  @FieldResolver()
  async comments(@Root() parent: User): Promise<Comment[]> {
    return Comment.find({ where: { userId: parent.id } });
  }

  @Mutation(() => User)
  async createUser(
    @Arg("name") name: string,
    @Arg("userId") userId: string,
    @Arg("password") password: string,
    @Arg("email") email: string
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 9);
    const user = User.create({
      name,
      userId,
      password: hashedPassword,
      email
    }).save();
    return user;
  }
}
