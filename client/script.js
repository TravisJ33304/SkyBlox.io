// canvas
let canvas, ctx;
// Set the time between each frame
const FPS = 60;
// connect to server
let socket = io();
// input variables
let keys = [];

let mouse = {
    x: 0,
    y: 0,
    down: false
};
// screen variables
let centerX = 0;
let centerY = 0;

function resize() {
    // resize the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    centerX = Math.floor(canvas.width / 2);
    centerY = Math.floor(canvas.height / 2);
}

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

window.onload = function () {
    // get canvas and context
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    // general canvas font
    ctx.font = "24px verdana";
    // size window
    resize();
    // canvas input events
    canvas.onmousedown = function () {
        mouse.down = true;
    };

    canvas.onmouseup = function () {
        mouse.down = false;
    };

    canvas.onmouseenter = function (e) {
        mouse.x = e.clientX - canvas.offsetLeft - translationX;
        mouse.y = e.clientY - canvas.offsetTop - translationY;
    };

    canvas.onmousemove = function (e) {
        mouse.x = e.clientX - canvas.offsetLeft - translationX;
        mouse.y = e.clientY - canvas.offsetTop - translationY;
    };

    canvas.onmouseover = function (e) {
        mouse.x = e.clientX - canvas.offsetLeft - translationX;
        mouse.y = e.clientY - canvas.offsetTop - translationY;
    };

    canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };
};

function render() {
    window.setInterval(function () {
        window.requestAnimationFrame(function () {
            // clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    }, 1000 / FPS);
}