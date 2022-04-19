const mongoose = require("mongoose");

const Post = mongoose.model(
  "Post",
  {
    title: {
      type: String,
    },
    body: {
      type: String,
    },
  }
);

module.exports = Post;
