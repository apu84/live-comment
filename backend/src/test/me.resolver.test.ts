import faker from "faker";
import { graphql, GraphQLSchema } from "graphql";
import { Connection } from "typeorm";
import { createSchema } from "../common/build-schema";
import { User } from "../entity/user";
import { initDb } from "../test-utils/init-db-connection";

let conn: Connection;
let schema: GraphQLSchema;

beforeAll(async () => {
  conn = await initDb();
  schema = await createSchema();
});

const meQuery = `
 {
  me {
    email
    name
    userId
  }
}
`;

describe("Me resolver", () => {
  it("logged in user", async () => {
    const data = {
      name: faker.name.firstName() + " " + faker.name.lastName(),
      userId: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    };
    const user = await User.create<User>(data).save();

    const response = await graphql({
      schema,
      source: meQuery,
      contextValue: {
        req: {
          session: {
            userId: user.id
          }
        },
        res: {
          clearCookie: () => jest.fn()
        }
      }
    });

    expect(response).toMatchObject({
      data: {
        me: {
          name: user.name,
          email: user.email,
          userId: user.userId
        }
      }
    });
  });
});

afterAll(async () => {
  await conn.close();
});
