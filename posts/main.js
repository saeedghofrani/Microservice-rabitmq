const amqp = require("amqplib/callback_api");
const Post = require("./database/Post");
require("./database/connector");

const errorHandler = (error) => {
  const result = { status: 500, errorMessage: "Something went wrong." };
  if (
    error.message?.includes(
      "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer"
    ) ||
    error.message?.includes("Cast to ObjectId")
  ) {
    result.status = 400;
    result.errorMessage = "Invalid post id.";
  }
  return result;
};

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    channel.assertQueue("fetchPosts", {
      durable: false,
    });
    channel.assertQueue("getPostById", {
      durable: false,
    });
    channel.assertQueue("createPost", {
      durable: false,
    });
    channel.assertQueue("deletePost", {
      durable: false,
    });
    channel.prefetch(1);
    channel.consume("fetchPosts", async function reply(msg) {
      const result = await Post.find();

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(result))
      );

      channel.ack(msg);
    });
    channel.consume("getPostById", async function reply(msg) {
      try {
        const post = await Post.findById(msg.content.toString());

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify({ post }))
        );
      } catch (error) {
        const result = errorHandler(error);
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(result))
        );
      }

      channel.ack(msg);
    });
    channel.consume("createPost", async function reply(msg) {
      const body = JSON.parse(msg.content.toString());
      const result = await Post.create(body);

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(result))
      );

      channel.ack(msg);
    });
    channel.consume("deletePost", async function reply(msg) {
      try {
        await Post.findByIdAndDelete(msg.content.toString());

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify("ok"))
        );
      } catch (error) {
        const result = errorHandler(error);
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(result))
        );
      }

      channel.ack(msg);
    });
  });
});
