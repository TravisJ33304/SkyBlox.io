let express = require("express");
const { createContext } = require("vm");
let app = express();
let http = require("http").createServer(app);

let io = require("socket.io")(http);

const tps = 64; // set the maximum game ticks per second
const port = 8080; // server port

let objects = []; // store active game objects
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

function getFOV(Player) { // take a player and return nearby objects
    let nearby = [];
    let fov = { // create an object to represent the players vision to compare to objects
        x: Player.x - 1920,
        y: Player.y - 1080,
        w: Player.x + 1920,
        h: Player.y + 1080
    };
    for (let obj of objects)
        if (getCollision(fov, obj))
            nearby.push(obj);
    return nearby;
}

function respawnPlayer(Player) { // player dies and gets reset
    Player = {
        ...Player,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        tools: ["none","none","none","none","none"],
        equipped: 0,
        inventory: {
            wood: 0,
            stone: 0,
            iron: 0,
            gold: 0,
            diamond: 0
        },
    };
}
// classes/objects
function Player(obj) { // add player attributes when player connects
    return {
        ...obj, // spread player to socket object
        type: "player", // type of object
        // position and size of player
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        ang: 0,
        health: 200,
        stamina: 200,
        resting: true,
        // movement
        vx: 0,
        vy: 0,
        maxSpeed: 1,
        // rendering and assets
        fov: [], // nearby objects
        img: "",
        // items
        tools: ["none","none","none","none","none"],
        equipped: 0,
        inventory: {
            wood: 0,
            stone: 0,
            iron: 0,
            gold: 0,
            diamond: 0
        },
        drawSelf: function(ctx) { // used by the client to render player specific data
            // render HUD
            ctx.drawRect(this.input.canvas.width - 320, 20, 300, 400); // inventory
        },
        draw: function(ctx) {
            // draw character
            ctx.save(); // rotate canvas to draw player direction
            ctx.translate(this.x, this.y);
            ctx.rotate(this.ang);
            ctx.drawImage(this.img, this.x, this.y); // draw player image
            ctx.drawImage(this.tools[equipped], this.x, this.y); // draw tool equipped
            ctx.restore();
        },
        update: function() {
            var self = this; // pass to function scope
            // process input
            if (this.keys.includes("shift") && this.stamina > 0) { // sprinting
                this.maxSpeed = 2;
                this.stamina--;
                this.resting = false;
                if (this.stamina === 0) // out of stamina
                    setTimeout(function() { // wait to regenerate stamina
                        self.resting = true;
                    }, 1000);
            } else // walking
                this.maxSpeed = 1;
            if (this.resting && this.stamina < 200) // regaining stamina
                this.stamina++;
            if (!this.crafting) { // can't move while in a menu
                if (Math.abs(this.vy) < this.maxSpeed) {
                    if (this.keys.includes("w") || this.keys.includes("arrowup")) // moving up
                        this.vy += 0.2;
                    if (this.keys.includes("s") || this.keys.includes("arrowdown")) // moving down
                        this.vy -= 0.2;
                }
                if (Math.abs(this.vx) < this.maxSpeed) {
                    if (this.keys.includes("a") || this.keys.includes("arrowleft")) // moving left
                        this.vx += 0.2;
                    if (this.keys.includes("d") || this.keys.includes("arrowright")) // moving right
                        this.vx -= 0.2;
                }
            }
            // friction
            this.vx *= 0.6;
            this.vy *= 0.6;
            if (this.mouse.down === true) { // clicking mouse

            }
        }
    };
}
// handle server io
io.on("connection", function (socket) { // start communication to client
    console.log("User connected: " + socket.id);
    socket = Player(socket); // add player attributes to socket
    objects.push(socket); // add new player to active users
    socket.on("initServer", function(data) {
        socket = { // merge new data into socket
            ...socket,
            ...data
        };
        // send output data to client
        data = socket.fov;
        socket.emit("initClient", data);
    });
    socket.on("clientPing", function(data) {
        socket = { // merge new data into socket
            ...socket,
            ...data
        };
        // send output data to client
        data = socket.fov;
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
    for (let obj of objects) { // iterate through game objects
        if (obj.type != "player") // find players
            continue;
        if (obj.updated === false) { // update player if not done yet
            obj.update();
            obj.updated = true;
            updated.push(obj);
        }
        obj.fov = getFov(obj);
        for (let near of obj.fov) { // update the objects around the player
            if (near.updated === true)
                continue;
            near.update();
            near.updated = true;
            updated.push(near);
        }
    }
    for (let obj of updated)
        obj.updated = false;
}, 1000/tps);