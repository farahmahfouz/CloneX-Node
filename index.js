const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
require("express-async-errors");


const userRouter = require("./Routes/usersRoutes");
const postRouter = require("./Routes/postsRoutes");

const logger = require("./utils/logger");
const AppError = require("./utils/App.Error");

const PORT = 8000;
const app = express();

dotenv.config();

// app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello From Another World");
});

app.use("/users", userRouter);
app.use("/posts", postRouter);

app.all("/*", (req, res, next) => {
  throw new AppError(
    `Error : Can't find ${req.originalUrl} on this server!`,
    404
  );
});

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    logger.info("Connected With MongoDB Server");
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.info(`Faild to connect with MongoDB`, err);
  });
