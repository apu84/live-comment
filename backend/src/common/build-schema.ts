import { buildSchema } from "type-graphql/dist";
import { Container } from "typedi";

export const createSchema = async () => {
  return buildSchema({
    resolvers: [__dirname + "/../**/*.resolver.ts"],
    container: Container
  });
};
