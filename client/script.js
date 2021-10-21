let objects; // track game objects
const fps = 60; // set the maximum frames per second rendered
let socket = io(); // connect to server
let input = { // input variables
    name: "",
    canvas: null,
    keys: [],
    mouse: {
        x: null,
        y: null,
        click: false
    }
};
// server communication
function init() { // send the first ping to the server
    input.name = document.getElementById("name").value; // get the player name
    let data = input;
    socket.emit("initServer", data); // send initial input data to the server
    document.getElementById("join").hidden = true; // hide join form
}

socket.on("initClient", function(data) { // receive the first output data from the server
    output = data; // store output data
    render(); // start rendering the game data
    data = input;
    socket.emit("clientPing", data); // send input back to the server
});

socket.on("serverPing", function(data) { // recieve server data
    output = data; // store output data
    data = input;
    socket.emit("clientPing", data);
});

function resize() { // resize the window
    input.canvas.width = window.innerWidth;
    input.canvas.height = window.innerHeight;

    //centerX = Math.floor(input.canvas.width / 2);
    //centerY = Math.floor(input.canvas.height / 2);
}

function render() { // draw game objects
    let ctx = input.canvas.getContext("2d"); // get canvas rendering context
    window.setInterval(function () { // main game render loop
        window.requestAnimationFrame(function () {
            ctx.clearRect(0, 0, input.canvas.width, input.canvas.height); // erase canvas to render new frame
            for (obj in objects) // draw each game object
                obj.draw(ctx);
        });
    }, 1000/fps);
}

// key input events
document.onkeydown = function (e) { // record key presses
    input.keys.push(e.key.toLowerCase());
};

document.onkeyup = function (e) { // requires further testing and optimization
    while (input.keys.includes(e.key.toLowerCase())) {
        input.keys.splice(input.keys.indexOf(e.key.toLowerCase()), 1);
    }
};

window.onload = function () { // initialize the canvas and input
    // get the canvas element
    input.canvas = document.getElementById("canvas");
    resize(); // size canvas to window
    document.body.onresize = resize(); // automatically resize canvas with the window
    // mouse tracking events
    input.canvas.onmousedown = function () {
        input.mouse.down = true;
    };

    input.canvas.onmouseup = function () {
        input.mouse.down = false;
    };

    input.canvas.onmouseenter = function (e) {
        input.mouse.x = e.clientX;
        input.mouse.y = e.clientY;
    };

    input.canvas.onmousemove = function (e) {
        input.mouse.x = e.clientX - input.canvas.offsetLeft - translationX;
        input.mouse.y = e.clientY - input.canvas.offsetTop - translationY;
    };

    input.canvas.onmouseover = function (e) {
        input.mouse.x = e.clientX - input.canvas.offsetLeft - translationX;
        input.mouse.y = e.clientY - input.canvas.offsetTop - translationY;
    };

    input.canvas.oncontextmenu = function (e) { // no context menu on right click
        e.preventDefault();
    };
};