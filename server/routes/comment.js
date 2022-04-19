const express = require("express");
const router = express.Router();
const initCommentControllers = require("../controller/comment");

function initCommentRouter(channel) {
  const controller = initCommentControllers(channel);
  router.get("/:id", controller.getAllPostComments);
  router.post("/:id", controller.createComment);
  return router;
}

module.exports = initCommentRouter;
