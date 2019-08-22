import faker from "faker";
import { graphql, GraphQLSchema } from "graphql";
import { Connection } from "typeorm";
import { createSchema } from "../common/build-schema";
import { User } from "../entity/user";
import { Comment } from "../entity/comment";
import { initDb } from "../test-utils/init-db-connection";

let conn: Connection;
let schema: GraphQLSchema;

beforeAll(async () => {
  conn = await initDb();
  schema = await createSchema();
});

function createUser(): Promise<User> {
  const userData = {
    name: faker.name.firstName() + " " + faker.name.lastName(),
    userId: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  };
  return User.create<User>(userData).save();
}

function createComment(userId: string): Promise<Comment> {
  const comment = {
    userId,
    content: faker.lorem.paragraph(1)
  };
  return Comment.create<Comment>(comment).save();
}

describe("Comment resolver", () => {
  it("Add comment as logged in user", async () => {
    const addCommentMutation = `
       mutation AddComment($data: CreateCommentInputType!){
        addComment(
          data: $data
        ) {
          content
          user {
            userId
          }
          version
        }
      }
    `;

    const user = await createUser();
    const data = {
      content: faker.lorem.paragraph(1)
    };

    const response = await graphql({
      schema,
      source: addCommentMutation,
      contextValue: {
        req: {
          session: {
            userId: user.id
          }
        }
      },
      variableValues: {
        data
      }
    });

    expect(response).toMatchObject({
      data: {
        addComment: {
          content: data.content,
          version: 1,
          user: {
            userId: user.userId
          }
        }
      }
    });
  });

  it("Edit comment as logged in user", async () => {
    const editCommentMutation = `
       mutation EditComment($data: EditCommentInputType!){
        editComment(
          data: $data
        ) {
          content
          user {
            userId
          }
          version
        }
      }
    `;

    const user = await createUser();
    const comment = await createComment(user.id);

    const data = {
      id: comment.id,
      content: faker.lorem.paragraph(1),
      version: comment.version
    };

    const response = await graphql({
      schema,
      source: editCommentMutation,
      contextValue: {
        req: {
          session: {
            userId: user.id
          }
        }
      },
      variableValues: {
        data
      }
    });

    expect(response).toMatchObject({
      data: {
        editComment: {
          content: data.content,
          version: data.version + 1,
          user: {
            userId: user.userId
          }
        }
      }
    });
  });

  it("Edit comment as not logged in user should fail", async () => {
    const editCommentMutation = `
       mutation EditComment($data: EditCommentInputType!){
        editComment(
          data: $data
        ) {
          content
          user {
            userId
          }
          version
        }
      }
    `;

    const user = await createUser();
    const comment = await createComment(user.id);

    const data = {
      id: comment.id,
      content: faker.lorem.paragraph(1),
      version: comment.version
    };

    const response = await graphql({
      schema,
      source: editCommentMutation,
      contextValue: {
        req: {
          session: {}
        }
      },
      variableValues: {
        data
      }
    });

    expect(response.errors).toBeDefined();
  });

  it("Edit comment as different user should fail", async () => {
    const editCommentMutation = `
       mutation EditComment($data: EditCommentInputType!){
        editComment(
          data: $data
        ) {
          content
          user {
            userId
          }
          version
        }
      }
    `;

    const user = await createUser();
    const comment = await createComment(user.id);

    const data = {
      id: comment.id,
      content: faker.lorem.paragraph(1),
      version: comment.version
    };

    const response = await graphql({
      schema,
      source: editCommentMutation,
      contextValue: {
        req: {
          session: {
            userId: faker.random.uuid()
          }
        }
      },
      variableValues: {
        data
      }
    });

    expect(response.errors).toBeDefined();
  });

  it("Edited comment should be saved as history", async () => {
    const commentHistory = `
    query CommentHistory($data: String!){
     commentEditHistory(id: $data) {
        content
     }
    }
    `;

    const user = await createUser();
    const comment = await createComment(user.id);
    const editedCommentContent = comment.content;

    const editCommentMutation = `
       mutation EditComment($data: EditCommentInputType!){
        editComment(
          data: $data
        ) {
          content
          user {
            userId
          }
          version
        }
      }
    `;

    const data = {
      id: comment.id,
      content: faker.lorem.paragraph(1),
      version: comment.version
    };

    await graphql({
      schema,
      source: editCommentMutation,
      contextValue: {
        req: {
          session: {
            userId: user.id
          }
        }
      },
      variableValues: {
        data
      }
    });

    const response = await graphql({
      schema,
      source: commentHistory,
      contextValue: {
        req: {
          session: {
            userId: user.id
          }
        }
      },
      variableValues: {
        data: comment.id
      }
    });

    expect(response).toMatchObject({
      data: {
        commentEditHistory: [
          {
            content: editedCommentContent
          }
        ]
      }
    });
  });
});

afterAll(async () => {
  await conn.close();
});
