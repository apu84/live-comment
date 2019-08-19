import "reflect-metadata";

import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql/dist";
import { CommentsResolver } from "./comment/comments.resolver";
import { ApolloServer } from "apollo-server-express/dist";
import Express from "express";
import { UsersResolver } from "./user/users.resolver";

const main = async () => {
  await createConnection();

  const schema = await buildSchema({
    resolvers: [CommentsResolver, UsersResolver]
  });

  const apolloServer = new ApolloServer({ schema });
  const app = Express();
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000/graphql");
  });
};

main();
