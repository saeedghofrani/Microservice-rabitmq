const initCommentControllers = (channel) => {
  const controller = {};

  controller.getAllPostComments = function (req, res, next) {
    function rpc(error2, q) {
      if (error2) {
        throw error2;
      }
      channel.consume(
        q.queue,
        function (msg) {
          const message = JSON.parse(msg.content.toString());
          res.status(message.status || 201).send(message);
        },
        {
          noAck: true,
        }
      );

      channel.sendToQueue("fetchComments", Buffer.from(req.params.id), {
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
  };

  controller.createComment = function (req, res, next) {
    if (!req.body.text || !req.params.id) {
      return res.status(400).send("Bad request.");
    }

    function rpc(error2, q) {
      if (error2) {
        throw error2;
      }
      channel.consume(
        q.queue,
        function (msg) {
          const message = JSON.parse(msg.content.toString());
          res.status(message.status || 201).send(message);
        },
        {
          noAck: true,
        }
      );

      channel.sendToQueue(
        "createComment",
        Buffer.from(
          JSON.stringify({ postId: req.params.id, text: req.body.text })
        ),
        {
          replyTo: q.queue,
        }
      );
    }

    channel.assertQueue(
      "",
      {
        exclusive: true,
      },
      rpc
    );
  };

  return controller;
};

module.exports = initCommentControllers;
