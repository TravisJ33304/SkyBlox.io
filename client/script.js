// set the maximum frames per second rendered
const fps = 60;
// connect to server
let socket = io();
// input variables
let keys = [];

let mouse = {
    x: 0,
    y: 0,
    click: false
};
// screen variables
let centerX = 0;
let centerY = 0;
// send the first ping to the server
function init() {
    let data = {
        name: document.getElementById('name').value,
        centerX: centerX,
        centerY: centerY
    };
    socket.emit('initialPing', data);
}
// recieve server data
socket.on("serverPing", function(data) {
    // TODO retrieve data from server
    data = {
        mouse: mouse,
        keys: keys
    };
    socket.emit("clientPing", data);
});

function resize(canvas) { // resize the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    centerX = Math.floor(canvas.width / 2);
    centerY = Math.floor(canvas.height / 2);
}

function render(canvas) { // draw game objects
    let ctx = canvas.getContext("2d");
    window.setInterval(function () {
        window.requestAnimationFrame(function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
        });
    }, 1000/fps);
}

// key input events
document.onkeydown = function (e) {
    keys.push(e.key);
};

document.onkeyup = function (e) {
    while (keys.includes(e.key.normalize())) {
        keys.splice(keys.indexOf(e.key.normalize()), 1);
    }
    //while (keys.includes(e.key.toUpperCase())) {
    //    keys.splice(keys.indexOf(e.key.toUpperCase()), 1);
    //}
    //while (keys.includes(e.key.toLowerCase())) {
    //    keys.splice(keys.indexOf(e.key.toLowerCase()), 1);
    //}
};

window.onload = function () { // initialize the canvas and input
    // get the canvas element
    let canvas = document.getElementById("canvas");
    resize(canvas); // size canvas to window
    document.body.onresize = resize(canvas); // automatically resize canvas with the window
    // mouse tracking events
    canvas.onmousedown = function () {
        mouse.down = true;
    };

    canvas.onmouseup = function () {
        mouse.down = false;
    };

    canvas.onmouseenter = function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };

    canvas.onmousemove = function (e) {
        mouse.x = e.clientX - canvas.offsetLeft - translationX;
        mouse.y = e.clientY - canvas.offsetTop - translationY;
    };

    canvas.onmouseover = function (e) {
        mouse.x = e.clientX - canvas.offsetLeft - translationX;
        mouse.y = e.clientY - canvas.offsetTop - translationY;
    };

    canvas.oncontextmenu = function (e) { // no context menu on right click
        e.preventDefault();
    };
};