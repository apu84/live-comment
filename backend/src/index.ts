import "reflect-metadata";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql/dist";
import { ApolloServer } from "apollo-server-express/dist";
import express from "express";
import { getSession } from "./common/user-session";
import { corsConfig } from "./common/cors-config";

const bootstrap = async () => {
  await createConnection();

  const schema = await buildSchema({
    resolvers: [__dirname + "/**/*.resolver.ts"]
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res })
  });

  const app = express();

  app.use(corsConfig());
  app.use(getSession());

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000/graphql");
  });
};

bootstrap();
