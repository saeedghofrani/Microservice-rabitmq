const amqp = require("amqplib/callback_api");
const Comment = require("./database/Comment");
const mongoose = require("mongoose");
require("./database/connector");

const errorHandler = (error) => {
  const result = {
    status: error.status || 500,
    errorMessage: error.errorMessage || "Something went wrong.",
  };
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
    channel.assertQueue("fetchComments", {
      durable: false,
    });
    channel.assertQueue("createComment", {
      durable: false,
    });
    channel.prefetch(1);
    channel.consume("fetchComments", async function reply(msg) {
      try {
        const result = await Comment.find({
          postId: mongoose.Types.ObjectId(msg.content.toString()),
        });

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify({ result }))
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
    channel.consume("createComment", async function reply(msg) {
      try {
        const { postId, text } = JSON.parse(msg.content.toString());

        function rpc(error2, q) {
          if (error2) {
            throw error2;
          }
          channel.consume(
            q.queue,
            async function (_msg) {
              const message = JSON.parse(_msg.content.toString());
              if (!message.post) {
                return channel.sendToQueue(
                  msg.properties.replyTo,
                  Buffer.from(JSON.stringify(message))
                );
              }

              const result = await Comment.create({ postId, text });

              channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify({ result }))
              );
            },
            {
              noAck: true,
            }
          );

          channel.sendToQueue("getPostById", Buffer.from(postId), {
            replyTo: q.queue,
          });
        }

        channel.assertQueue(
          "",
          {
            exclusive: true,
          },
          rpc
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
