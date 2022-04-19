const mongoose = require("mongoose");

const Comment = mongoose.model("Comment", {
  postId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  text: {
    type: String,
  },
});

module.exports = Comment;
