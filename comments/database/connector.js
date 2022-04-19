const mongoose = require("mongoose");

(async () => {
  try {
    mongoose.connect("mongodb://localhost:27018/comments");
  } catch (error) {
    console.log(error);
  }
})();
