var express = require("express");
var app = express();
var http = require("http").createServer(app);

var io = require("socket.io")(http);

app.use("/client", express.static(__dirname + "/client"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});

io.on("connection", function (socket) {
    console.log("an user connected; id: " + socket.id);
    socket.on("disconnect", function() {
        console.log("user disconnected");
    });
});

http.listen(8080, function () {
    console.log("listening");
});