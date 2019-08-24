import { ApolloServer } from "apollo-server-express/dist";
import express from "express";
import "reflect-metadata";
import { createServer } from "http";
import { createConnections, useContainer } from "typeorm";
import { createSchema } from "./common/build-schema";
import { corsConfig } from "./common/cors-config";
import { getSession } from "./common/user-session";
import { Container } from "typedi";

const bootstrap = async () => {
  useContainer(Container);
  await createConnections();

  const schema = await createSchema();

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res })
  });

  const app = express();

  app.use(corsConfig());
  app.use(getSession());

  apolloServer.applyMiddleware({ app });

  const httpServer = createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
    );
    console.log(
      `🚀 Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`
    );
  });
};

bootstrap();
