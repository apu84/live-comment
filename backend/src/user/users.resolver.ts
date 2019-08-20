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

@Resolver(User)
export class UsersResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  async user(@Arg("email") email: string): Promise<User | undefined> {
    return User.findOne({ where: { email } });
  }

  @FieldResolver()
  async comments(@Root() parent: User): Promise<Comment[]> {
    return Comment.find<Comment>({ where: { userId: parent.id } });
  }

  @Mutation(() => User)
  async createUser(
    @Arg("name") name: string,
    @Arg("userId") userId: string,
    @Arg("password") password: string,
    @Arg("email") email: string
  ): Promise<User> {
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
