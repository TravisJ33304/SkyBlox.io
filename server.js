let express = require("express");
let app = express();
let http = require("http").createServer(app);

let io = require("socket.io")(http);

const tps = 64; // set the maximum game ticks per second
const port = 8080; // server port

let clients = []; // store active users

app.use("/client", express.static(__dirname + "/client"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});

io.on("connection", function (socket) {
    console.log("User connected: " + socket.id);
    clients.push(socket); // add to active users
    socket.on("initialPing", function(data) {
        socket.name = data.name; // set player username
        // SEND DATA FOR NEARBY OBJECTS ONLY FOR SECURITY
        let data = { // TODO send players and map data
            player: socket,
        };
        socket.emit("serverPing", data);
    });
    socket.on("clientPing", function(data) {
        socket.input = data; // store input data
        data = {
            player: socket,
        };
        socket.emit("serverPing", data);
    });
    socket.on("disconnect", function() {
        console.log("User disconnected: " + socket.id);
        clients.splice(clients.indexOf(socket), 1); // remove userdata
    });
});

http.listen(port, function () { // start the server
    console.log("Listening on port: " + port);
});

setInterval(function() { // server game tick
    clients.forEach();
}, 1000/tps);