import cors from "cors";

export const corsConfig = () => {
  return cors({
    credentials: true,
    origin: "http://localhost:3000"
  });
};
