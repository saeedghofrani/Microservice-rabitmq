const mongoose = require("mongoose");

(async () => {
  try {
    mongoose.connect("mongodb://localhost:27017/posts");
  } catch (error) {
    console.log(error);
  }
})();
