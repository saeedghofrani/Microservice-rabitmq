const express = require("express");
const router = express.Router();
const amqp = require("amqplib/callback_api");
const initPostRouter = require("./post");
const initCommentRouter = require("./comment");

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    const postRouter = initPostRouter(channel);
    const commentRouter = initCommentRouter(channel);

    router.use("/posts", postRouter);
    router.use("/comments", commentRouter);
  });
});

module.exports = router;
