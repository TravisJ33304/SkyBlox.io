let express = require("express");
const { createContext } = require("vm");
let app = express();
let http = require("http").createServer(app);

let io = require("socket.io")(http);

const tps = 64; // set the maximum game ticks per second
const port = 8080; // server port

let objects = []; // store active users
// serve webpage to client
app.use("/client", express.static(__dirname + "/client"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});
// utility functions
function getCollision(obj1, obj2) { // detect collisions between objects
    return (
        obj1.x < obj2.x + obj2.w &&
        obj1.x + obj1.w > obj2.x &&
        obj1.y < obj2.y + obj2.h &&
        obj1.y + obj1.h > obj2.y
    );
}

function edgeCollision(obj1, obj2) { // prevent objects from crossing each other
    let velX = obj1.x + obj1.w / 2 - (obj2.x + obj2.w / 2);
    let velY = obj1.y + obj1.h / 2 - (obj2.y + obj2.h / 2);

    let hws = obj1.w / 2 + obj2.w / 2;
    let hhs = obj1.h / 2 + obj2.h / 2;

    let colDir = null; // value if no collision
    if (Math.abs(velX) < hws && Math.abs(velY) < hhs) { // detect collision
        let oX = hws - Math.abs(velX);
        let oY = hhs - Math.abs(velY);
        if (oX >= oY) { // vertical collision
            if (velY > 0) { // collision on top
                colDir = "up";
                obj1.y += oY;
            } else { // collision on bottom
                colDir = "down";
                obj1.y -= oY;
            }
        } else { // side collision
            if (velX > 0) { // collision on the left side
                colDir = "left";
                obj1.x += oX;
            } else { // collision on the right side
                colDir = "right";
                obj1.x -= oX;
            }
        }
    }
    return colDir;
}

function getFOV(player) {
    let nearby = [];
    let fov = {
        x: 0,
        y: 0,
        w: 0,
        h: 0
    };
    for (obj in objects) {
        if (getCollision(fov, obj))
            nearby.push(obj);
    }
    return nearby;
}
// classes/objects
function createPlayer(obj) { // add player attributes when player connects
    obj = {
        ...obj,
        type: "player",
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        ang: 0,
        img: "",
        draw: function(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.ang);
            ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
            ctx.restore();
        },
        update: function() {

        }
    };
}
// handle server io
io.on("connection", function (socket) { // start communication to client
    console.log("User connected: " + socket.id);
    objects.push(createPlayer(socket)); // add new player to active users
    socket.on("initServer", function(data) {
        socket = { // merge new data into socket
            ...socket,
            ...data
        };
        // send output data to client
        data = getFOV(socket);
        socket.emit("initClient", data);
    });
    socket.on("clientPing", function(data) {
        socket = { // merge new data into socket
            ...socket,
            ...data
        };
        // send output data to client
        data = getFOV(socket);
        socket.emit("serverPing", data);
    });
    socket.on("disconnect", function() {
        console.log("User disconnected: " + socket.id);
        objects.splice(objects.indexOf(socket), 1); // remove userdata
    });
});

http.listen(port, function () { // start the server
    console.log("Listening on port: " + port);
});
// run the game
setInterval(function() { // server game tick
    let updated = [];
    for (obj in objects) {
        if (obj.type == "player") {
            obj.update();
            obj.updated = true;
            for (near in getFOV(obj))
                if (near.updated === false) {
                    near.update();
                    near.updated = true;
                }
        }
    }
    for (obj in updated)
        obj.updated = false;
}, 1000/tps);