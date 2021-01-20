var express = require("express");
var app = express();
var http = require("http").createServer(app);

var io = require("socket.io")(http);

var tps = 64;

app.use("/client", express.static(__dirname + "/client"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});

io.on("connection", function (socket) {
    console.log("user connected: " + socket.id);
    socket.name = socket.id;
    socket.on("clientPing", function(data) {
        socket.input = data;
    });
    socket.on("initialPing", function(name) {
        socket.name = name;
        socket.emit("serverPing", {socket: socket}); // TODO send players and map data
    });
    socket.on("disconnect", function() {
        console.log("user disconnected: " + socket.id);
    });
});

http.listen(8080, function () {
    console.log("listening");
});

setInterval(function() { // server game tick

}, 1000/tps);