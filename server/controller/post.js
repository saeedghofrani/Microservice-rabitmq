const initPostControllers = (channel) => {
  const controller = {};

  controller.getAllPosts = function (req, res, next) {
    function rpc(error2, q) {
      if (error2) {
        throw error2;
      }
      channel.consume(
        q.queue,
        function (msg) {
          res.send(msg.content.toString());
        },
        {
          noAck: true,
        }
      );

      channel.sendToQueue("fetchPosts", Buffer.from(""), {
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

  controller.createPost = function (req, res, next) {
    if (!req.body.title || !req.body.body) {
      return res.status(400).send({ msg: "Bad request." });
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

      channel.sendToQueue("createPost", Buffer.from(JSON.stringify(req.body)), {
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

  controller.removePost = function (req, res, next) {
    if (!req.params.id) {
      return res.status(400).send({ msg: "Bad request." });
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

      channel.sendToQueue("deletePost", Buffer.from(String(req.params.id)), {
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

  return controller;
};

module.exports = initPostControllers;
