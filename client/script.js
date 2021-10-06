// canvas
var canvas, ctx;
// Set the time between each frame
var fps = 60;
// connect to server
var socket = io();
// input variables
var keys = [];

var mouse = {
    x: 0,
    y: 0,
    click: false
};
// screen variables
var centerX = 0;
var centerY = 0;

socket.on("serverPing", function(data) {
    // retrieve data from server
});

function resize() { // resize the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    centerX = Math.floor(canvas.width / 2);
    centerY = Math.floor(canvas.height / 2);
}

function render() { // draw game objects
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
    while (keys.includes(e.key)) {
        keys.splice(keys.indexOf(e.key), 1);
    }
    while (keys.includes(e.key.toUpperCase())) {
        keys.splice(keys.indexOf(e.key.toUpperCase()), 1);
    }
    while (keys.includes(e.key.toLowerCase())) {
        keys.splice(keys.indexOf(e.key.toLowerCase()), 1);
    }
};

window.onload = function () { // initialize the canvas and input
    // get canvas and context
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    ctx.font = "24px verdana"; // general canvas font
    resize(); // size window
    // canvas input events
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