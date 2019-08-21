import { graphql, GraphQLSchema } from "graphql";
import { initDb } from "../test-utils/init-db-connection";
import { Connection } from "typeorm";
import { buildSchema } from "type-graphql/dist";
import faker from "faker";

let conn: Connection;
let schema: GraphQLSchema;

beforeAll(async () => {
  conn = await initDb();
  schema = await buildSchema({
    resolvers: [__dirname + "/../**/*.resolver.ts"]
  });
});

const registerMutation = `
mutation Register($data: RegisterUserInputType!) {
  createUser(
    data: $data
  ) {
    email
    name
    userId
  }
}
`;

describe("Register", () => {
  it("create user", async () => {
    const data = {
      name: faker.name.firstName() + " " + faker.name.lastName(),
      userId: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    };
    const response = await graphql({
      schema,
      source: registerMutation,
      variableValues: {
        data
      }
    });

    expect(response).toMatchObject({
      data: {
        createUser: {
          name: data.name,
          email: data.email,
          userId: data.userId
        }
      }
    });
  });
});

afterAll(async () => {
  await conn.close();
});
