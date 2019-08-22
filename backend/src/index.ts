import { ApolloServer } from "apollo-server-express/dist";
import express from "express";
import "reflect-metadata";
import { createConnections } from "typeorm";
import { createSchema } from "./common/build-schema";
import { corsConfig } from "./common/cors-config";
import { getSession } from "./common/user-session";
import { DistributedEntityManager } from "./common/decorator/distributed-entitity-manager";
import { Container } from "typedi";

const bootstrap = async () => {
  const connections = await createConnections();
  const dem = new DistributedEntityManager(
    connections.map(connection => connection.manager)
  );
  Container.set(DistributedEntityManager, dem);

  const schema = await createSchema();

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
