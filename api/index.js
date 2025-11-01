import express from "express";
import cors from "cors";
import postsRouter from "./src/posts/index.js";
import partnersRouter from "./src/partners/index.js";
import usersRouter from "./src/users/index.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/posts", postsRouter);
app.use("/partners", partnersRouter);
app.use("/users", usersRouter);

app.get("/", (req, res) => {
  res.send("🚀 Vercel Express API + Firebase is running");
});

export default app;
