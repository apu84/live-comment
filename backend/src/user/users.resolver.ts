import {
  Arg,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root
} from "type-graphql/dist";
import { User } from "../entity/user";
import { Comment } from "../entity/comment";
import bcrypt from "bcryptjs";
import { RegisterUserInputType } from "./register-user.input";
import { UseMiddleware } from "type-graphql/dist";
import { isAuthenticated } from "../common/middleware/authenticated";

@Resolver(User)
export class UsersResolver {
  @UseMiddleware(isAuthenticated)
  @Query(() => [User])
  async users(): Promise<User[]> {
    return User.find<User>();
  }

  @Query(() => User, { nullable: true })
  async user(@Arg("email") email: string): Promise<User | undefined> {
    return User.findOne({ where: { email } });
  }

  @FieldResolver(() => [Comment], { nullable: true })
  async comments(@Root() parent: User): Promise<Comment[]> {
    return Comment.find<Comment>({ where: { userId: parent.id } });
  }

  @Mutation(() => User)
  async createUser(@Arg("data")
  {
    name,
    userId,
    email,
    password
  }: RegisterUserInputType): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 9);
    const user = User.create<User>({
      name,
      userId,
      password: hashedPassword,
      email
    }).save();
    return user;
  }
}
