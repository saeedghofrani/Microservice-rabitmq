const express = require("express");
const router = express.Router();
const initPostControllers = require("../controller/post");

function initPostRouter(channel) {
  const controller = initPostControllers(channel);
  router.get("/", controller.getAllPosts);
  router.post("/", controller.createPost);
  router.delete("/:id", controller.removePost);
  return router;
}

module.exports = initPostRouter;
