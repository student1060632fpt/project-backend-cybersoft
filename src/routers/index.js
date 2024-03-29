"use strict";

const express = require("express");
const { authenticate } = require("../middleware");
const movieRouter = require("./movies");
const ticketRouter = require("./tickets");
const userRouter = require("./users");
const roleRouter = require("./users/roles");
const systemTheaterRouter = require("./systemTheater/index");
const groupTheaterRouter = require("./groupTheater/index");
const showTimeRouter = require("./showTime");

//rôi router từ thằng express
const rootRouter = express.Router();

//dùng thẳng middleware ở đây luôn để khỏi authenticate từng cái
rootRouter.use("/movies", movieRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/ticket", ticketRouter);
rootRouter.use("/roles", roleRouter);
rootRouter.use("/system-theater", systemTheaterRouter);
rootRouter.use("/group-theater", groupTheaterRouter);
rootRouter.use("/show-time", showTimeRouter);

//define ra đường dẫn chính/phụ
rootRouter.get("/", (request, response) => {
  response.send("hello word ");
});

module.exports = rootRouter;
