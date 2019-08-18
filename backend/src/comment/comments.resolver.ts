import { Resolver, Query } from "type-graphql/dist";

@Resolver()
export class CommentsResolver {
  @Query(() => String)
  async hello() {
    return "hello-world";
  }
}
