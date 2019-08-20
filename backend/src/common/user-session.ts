import session from "express-session";
import connectRedis from "connect-redis";
import Redis from "ioredis";

const RedisStore = connectRedis(session);

export const getSession = () => {
  return session({
    store: new RedisStore({
      client: new Redis() as any
    }),
    name: "qid",
    secret: "long-range",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7 * 365 // 7 years
    }
  });
};
