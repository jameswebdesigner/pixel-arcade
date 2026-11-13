const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// Disable right-click browser menu inside the game
canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});
// Track the mouse position
const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();

    mouse.x = (event.clientX - rect.left) * canvas.width / rect.width;
    mouse.y = (event.clientY - rect.top) * canvas.height / rect.height;
});
// Arrow storage
const arrows = [];
// Bow recharge system
let lastShotTime = 0;
const rechargeTime = 300;
// Bow charging
let isCharging = false;
let chargeStart = 0;

// HOLD MOUSE TO PULL BACK THE BOW
canvas.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;

    const now = Date.now();

    // Check recharge
    if (now - lastShotTime < rechargeTime) {
        return;
    }

    isCharging = true;
    chargeStart = now;
});

// RELEASE TO FIRE!
window.addEventListener("mouseup", (event) => {
    if (!isCharging || event.button !== 0) return;

    isCharging = false;

    const angle = Math.atan2(
        mouse.y - player.y,
        mouse.x - player.x
    );

    arrows.push({
        x: player.x,
        y: player.y,
        angle: angle,
        speed: 22
    });

    lastShotTime = Date.now();
});

function drawForest() {
    // Bright cartoon grass
    ctx.fillStyle = "#75b957";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tiny grass patches
    ctx.strokeStyle = "#4b8c37";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    for (let i = 0; i < 130; i++) {
        const x = (i * 73 + 19) % canvas.width;
        const y = (i * 47 + 31) % canvas.height;

        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x - 7, y - 6);
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 9);
        ctx.moveTo(x + 5, y);
        ctx.lineTo(x + 7, y - 5);
        ctx.stroke();
    }
}
function drawTree(x, y) {
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#263c28";

    // Brown trunk
    ctx.fillStyle = "#875333";
    ctx.fillRect(x - 12, y - 10, 24, 50);
    ctx.strokeRect(x - 12, y - 10, 24, 50);

    // Three pointed layers of pine branches
    const layers = [
    // Bottom layer — drawn first, behind everything
    { top: y - 55, bottom: y + 10, width: 54 },

    // Middle layer
    { top: y - 75, bottom: y - 15, width: 43 },

    // Top layer — drawn last, in front
    { top: y - 95, bottom: y - 35, width: 32 }
];

    layers.forEach((layer, i) => {
        ctx.fillStyle = i === 0 ? "#26763a" :
                i === 1 ? "#348a43" : "#429c4e";

        ctx.beginPath();
        ctx.moveTo(x, layer.top);
        ctx.lineTo(x + layer.width, layer.bottom);
        ctx.lineTo(x - layer.width, layer.bottom);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();
    });

    ctx.restore();
}
// BLUE BLOB DODGE SMEAR STREAKS
// BLUE BLOB CARTOON AFTERIMAGES
// ROTATING BLUE BLOB GHOST IMAGES
function drawDodgeAfterimages(x, y) {
    if (!isDodging) return;

    const progress = Math.min(
        1,
        (performance.now() - dodgeStartTime) / dodgeDuration
    );

    const spinDirection = dodgeDirectionX < 0 ? -1 : 1;

    ctx.save();

    // Draw three ghost copies behind Blue Blob
    for (let i = 3; i >= 1; i--) {
        const ghostX = x - dodgeDirectionX * i * 18;
        const ghostY = y - dodgeDirectionY * i * 18;

        // Each ghost shows an earlier rotation
        const ghostProgress = Math.max(0, progress - i * 0.12);
        const ghostAngle =
            ghostProgress * Math.PI * 2 * spinDirection;

        ctx.save();
        ctx.translate(ghostX, ghostY);
        ctx.rotate(ghostAngle);

        // Older ghosts are more transparent
        ctx.globalAlpha = 0.12 + (4 - i) * 0.1;

        // Blue Blob's square body
        ctx.fillStyle = "#3498f5";
        ctx.beginPath();
        ctx.roundRect(-18, -18, 36, 36, 5);
        ctx.fill();

        // Antennae
        ctx.fillRect(-12, -26, 7, 10);
        ctx.fillRect(5, -26, 7, 10);

        // Ghost eyes
        ctx.fillStyle = "white";
        ctx.fillRect(-11, -7, 8, 8);
        ctx.fillRect(4, -7, 8, 8);

        ctx.restore();
    }

    ctx.restore();
}
function drawDodgeSmear(x, y) {
    if (!isDodging) return;

    const progress = Math.min(
        1,
        (performance.now() - dodgeStartTime) / dodgeDuration
    );

    const strength = Math.sin(progress * Math.PI);

    ctx.save();

    ctx.strokeStyle = `rgba(45, 150, 255, ${strength * 0.55})`;
    ctx.lineCap = "round";

    // Three streaks trailing behind Blue Blob
    for (let i = 0; i < 3; i++) {
        const distance = 20 + i * 13;

        ctx.beginPath();
        ctx.lineWidth = 8 - i * 2;

        ctx.moveTo(
            x - dodgeDirectionX * distance,
            y - dodgeDirectionY * distance - 12 + i * 12
        );

        ctx.lineTo(
            x - dodgeDirectionX * (distance + 25),
            y - dodgeDirectionY * (distance + 25) - 12 + i * 12
        );

        ctx.stroke();
    }

    ctx.restore();
}
function drawPlayer(x, y) {
    drawDodgeAfterimages(x, y);
    ctx.save();
       const time = performance.now() / 1000;

// Is Blue Blob walking?
const walking =
    keys["w"] || keys["s"] ||
    keys["a"] || keys["d"] ||
    keys["arrowup"] || keys["arrowdown"] ||
    keys["arrowleft"] || keys["arrowright"];

// Faster animation when walking!
const speed = walking ? 12 : 3;

const squish = Math.sin(time * speed) * (walking ? 0.06 : 0.025);
const bob = Math.sin(time * speed) * (walking ? 4 : 2);

    // Gentle side-to-side rotation
const rotation = Math.sin(time * speed) * (walking ? 0.12 : 0.035);

// Move the rotation point to Blue Blob's center
ctx.translate(x, y + bob);
// SLOW CARTOON DODGE ROLL
if (isDodging) {
    const rollProgress = Math.min(
        1,
        (performance.now() - dodgeStartTime) / dodgeDuration
    );

    // One complete rotation per dodge
    const rollSpin = rollProgress * Math.PI * 2;

    // Roll direction
    const spinDirection =
        dodgeDirectionX < 0 ? -1 : 1;

    // Rotate Blue Blob without stretching him
    ctx.rotate(rollSpin * spinDirection);
}

// Rotate and squish!
ctx.rotate(rotation);
ctx.scale(1 + squish, 1 - squish);

// Move back to normal drawing coordinates
ctx.translate(-x, -y);

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#172b42";
    ctx.lineJoin = "round";

    // Animated legs — attached to the body!
const footSwing = walking ? Math.sin(time * 12) * 5 : 0;

ctx.fillStyle = "#000000";

// Left leg
ctx.fillRect(
    x - 14,
    y + 14,
    9,
    17 + footSwing
);

// Right leg
ctx.fillRect(
    x + 5,
    y + 14,
    9,
    17 - footSwing
);

    // Two square antennae
    ctx.fillStyle = "#000000";
    ctx.fillRect(x - 15, y - 30, 6, 12);
    ctx.fillRect(x + 9, y - 30, 6, 12);

    ctx.fillStyle = "#58b5ff";
    ctx.fillRect(x - 19, y - 36, 14, 10);
    ctx.fillRect(x + 5, y - 36, 14, 10);

    // Soft blue SQUARE blob body — not metal!
    ctx.fillStyle = "#3498f5";
    ctx.beginPath();
    ctx.roundRect(x - 22, y - 20, 44, 40, 5);
    ctx.fill();
    ctx.stroke();

    
    // Big white eyes
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x - 9, y - 3, 7, 0, Math.PI * 2);
    ctx.arc(x + 9, y - 3, 7, 0, Math.PI * 2);
    ctx.fill();

    // Eyes follow the mouse!
const eyeDX = mouse.x - x;
const eyeDY = mouse.y - y;

const eyeAngle = Math.atan2(eyeDY, eyeDX);

const pupilX = Math.cos(eyeAngle) * 3;
const pupilY = Math.sin(eyeAngle) * 3;

ctx.fillStyle = "#000000";
ctx.beginPath();

ctx.arc(x - 9 + pupilX, y - 3 + pupilY, 3, 0, Math.PI * 2);
ctx.arc(x + 9 + pupilX, y - 3 + pupilY, 3, 0, Math.PI * 2);

ctx.fill();
    
// BLUE BLOB'S BOW!
ctx.save();

// Aim toward the mouse
const bowAngle = Math.atan2(
    mouse.y - y,
    mouse.x - x
);

ctx.translate(x, y);
ctx.rotate(bowAngle);

// Wooden bow
ctx.strokeStyle = "#713e20";
ctx.lineWidth = 5;
ctx.lineCap = "round";

ctx.beginPath();
ctx.arc(25, 0, 17, -Math.PI / 2, Math.PI / 2);
ctx.stroke();

// ANIMATED BOWSTRING!
ctx.strokeStyle = "#f5e6c8";
ctx.lineWidth = 2;

// Pull string backward while charging
const chargeAmount = isCharging
    ? Math.min((Date.now() - chargeStart) / 600, 1)
    : 0;

const pullBack = chargeAmount * 14;

ctx.beginPath();
ctx.moveTo(25, -17);

// String pulls backward from the center
ctx.quadraticCurveTo(
    25 - pullBack,
    0,
    25,
    17
);

ctx.stroke();

// Little nocked arrow while charging
// Little nocked arrow while charging
if (isCharging) {
    const arrowStart = 25 - pullBack;
    const arrowTip = 55 - pullBack;

    // Wooden arrow shaft
    ctx.strokeStyle = "#875333";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(arrowStart, 0);
    ctx.lineTo(arrowTip, 0);
    ctx.stroke();

    // Sharp arrowhead!
    ctx.fillStyle = "#d8d8d8";
    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(arrowTip + 7, 0);
    ctx.lineTo(arrowTip - 2, -6);
    ctx.lineTo(arrowTip - 2, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}   

ctx.restore();
    ctx.restore();
}
drawForest();

// Our first forest!
drawTree(100, 140);
drawTree(250, 100);
drawTree(420, 160);
drawTree(600, 110);
drawTree(790, 150);

drawTree(150, 430);
drawTree(350, 460);
drawTree(550, 420);
drawTree(750, 450);
// Our hero!
// Blue Blob's position
const player = {
    x: 450,
    y: 250,
    speed: 3
};
// BLUE BLOB DODGE ROLL
let isDodging = false;
let dodgeStartTime = 0;
let dodgeDuration = 350;
let dodgeCooldown = 650;

let lastDodgeTime = -Infinity;

let dodgeDirectionX = 0;
let dodgeDirectionY = 0;

const dodgeSpeed = 10;
// FOREST Q ROOM SYSTEM
let currentRoom = 0;
// SMOOTH ROOM TRANSITIONS
let isTransitioning = false;
let transitionDirection = 0;
let transitionProgress = 0;
let transitionStartTime = 0;
const transitionDuration = 450;

// Save a picture of the previous room
const previousRoomCanvas = document.createElement("canvas");
previousRoomCanvas.width = canvas.width;
previousRoomCanvas.height = canvas.height;
const previousRoomCtx = previousRoomCanvas.getContext("2d");

// Each room has its own trees!
const forestRooms = [
    {
        name: "Starting Clearing",
        trees: [
            [100, 140],
            [250, 100],
            [420, 160],
            [600, 110],
            [790, 150],
            [150, 430],
            [350, 460],
            [550, 420],
            [750, 450]
        ]
    },
    {
    name: "West Forest",
    trees: generateRandomTrees()
},
    {
        name: "East Forest",
        trees: generateRandomTrees()
    }
];
// Remember which keys are being held
const keys = {};

document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    keys[key] = true;
    console.log("KEY PRESSED:", event.code);
    // START BLUE BLOB'S DODGE ROLL
if (event.code === "Space" || event.code === "ShiftLeft") {
    event.preventDefault();

    const now = performance.now();

    if (!isDodging && now - lastDodgeTime >= dodgeCooldown) {
        // Find which direction Blue Blob is moving
        let dx = 0;
        let dy = 0;

        if (keys["a"] || keys["arrowleft"]) dx--;
        if (keys["d"] || keys["arrowright"]) dx++;
        if (keys["w"] || keys["arrowup"]) dy--;
        if (keys["s"] || keys["arrowdown"]) dy++;

        // Only dodge when moving
        if (dx !== 0 || dy !== 0) {
            const length = Math.hypot(dx, dy);

            dodgeDirectionX = dx / length;
            dodgeDirectionY = dy / length;

            isDodging = true;
            dodgeStartTime = now;
            lastDodgeTime = now;
        }
    }
}

    if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});
// GLOWING FOREST EXITS
function drawExits() {
    const time = performance.now() / 1000;
    const glow = 0.35 + Math.sin(time * 3) * 0.15;

    const exitY = canvas.height / 2;
    const exitHeight = 130;

    function drawExit(x, direction) {
        ctx.save();

        // Glowing green doorway
        ctx.fillStyle = `rgba(165, 255, 136, ${glow})`;
        ctx.fillRect(
            x,
            exitY - exitHeight / 2,
            18,
            exitHeight
        );

        // Bright border
        ctx.strokeStyle = "#c5ff9a";
        ctx.lineWidth = 3;
        ctx.strokeRect(
            x,
            exitY - exitHeight / 2,
            18,
            exitHeight
        );

        // Direction arrow
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 35px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            direction,
            x + 9,
            exitY + 12
        );

        ctx.restore();
    }

    // West exit
    if (currentRoom !== 1) {
        drawExit(0, "←");
    }

    // East exit
    if (currentRoom !== 2) {
        drawExit(canvas.width - 18, "→");
    }
}
// Save the old room whenever Blue Blob enters a new room
function saveOldRoom() {
    // Remember the room we're leaving
    previousRoomCtx.clearRect(0, 0, canvas.width, canvas.height);
    previousRoomCtx.drawImage(canvas, 0, 0);

    // Start the transition clock
    transitionStartTime = performance.now();
    transitionProgress = 0;
    isTransitioning = true;
}
// RANDOM FOREST GENERATOR
function generateRandomTrees() {
    const trees = [];
    let attempts = 0;
const maxAttempts = 200;

    // Create 9 random trees
    for (let i = 0; i < 9 && attempts < maxAttempts; i++) {
        let x;
        let y;

        // Find a safe place for each tree
        do {
            x = 70 + Math.random() * (canvas.width - 140);
            y = 90 + Math.random() * (canvas.height - 140);
            attempts++;
        } while (
    // Keep the center starting area clear
    (
        Math.abs(x - canvas.width / 2) < 80 &&
        Math.abs(y - canvas.height / 2) < 80
    ) ||

    // Keep trees from growing too close together
    trees.some(([treeX, treeY]) => {
        const distance = Math.hypot(
            x - treeX,
            y - treeY
        );

        return distance < 130;
    })
);

        trees.push([x, y]);
    }

    return trees;
}
function gameLoop() {
    // Move Blue Blob
    // BLUE BLOB MOVEMENT AND DODGE ROLL
if (isDodging) {
    const dodgeElapsed = performance.now() - dodgeStartTime;

    if (dodgeElapsed < dodgeDuration) {
        // Zoom in the direction of the dodge!
        player.x += dodgeDirectionX * dodgeSpeed;
        player.y += dodgeDirectionY * dodgeSpeed;
    } else {
        // Dodge finished
        isDodging = false;
    }
} else {
    // Normal walking
    if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
    if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
    if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
    if (keys["d"] || keys["arrowright"]) player.x += player.speed;
}

    // Keep him inside the game screen
    // Keep Blue Blob inside the top and bottom
player.y = Math.max(45, Math.min(canvas.height - 30, player.y));

// Blue Blob must be inside the glowing doorway
const doorwayTop = canvas.height / 2 - 65;
const doorwayBottom = canvas.height / 2 + 65;

const insideDoorway =
    player.y >= doorwayTop &&
    player.y <= doorwayBottom;
    
// WEST EXIT
if (player.x < 0 && insideDoorway) {
    if (currentRoom === 0) {
       transitionDirection = -1;
saveOldRoom();
        currentRoom = 1;
        player.x = canvas.width - 30;
        arrows.length = 0;
    } else if (currentRoom === 2) {
        transitionDirection = -1;
        saveOldRoom();
        currentRoom = 0;
        player.x = canvas.width - 30;
        arrows.length = 0;
    } else {
        player.x = 0;
    }
}

// EAST EXIT
if (player.x > canvas.width && insideDoorway) {
    if (currentRoom === 0) {
        transitionDirection = 1;
        
        saveOldRoom();
        currentRoom = 2;
        player.x = 30;
        arrows.length = 0;
    } else if (currentRoom === 1) {
        transitionDirection = 1;
        saveOldRoom();
        currentRoom = 0;
        player.x = 30;
        arrows.length = 0;
    } else {
        player.x = canvas.width;
    }
}
// Block the edges outside the glowing doorways
if (!insideDoorway) {
    player.x = Math.max(0, Math.min(canvas.width, player.x));
}
    // Clear the old frame
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Redraw the grassy background
drawForest();
drawExits();

    // Get the trees for the current room
const trees = forestRooms[currentRoom].trees;

// Combine trees and player into one drawing list
const objects = trees.map(([x, y]) => ({
    type: "tree",
    x: x,
    y: y
}));

objects.push({
    type: "player",
    x: player.x,
    y: player.y
});

// Draw objects from back to front
objects.sort((a, b) => a.y - b.y);

objects.forEach(obj => {
    if (obj.type === "tree") {
        drawTree(obj.x, obj.y);
    } else {
    drawPlayer(obj.x, obj.y);

    // BOW RECHARGE BAR
    const progress = Math.min(
        1,
        (Date.now() - lastShotTime) / rechargeTime
    );

    // Bar background
    ctx.fillStyle = "#263c28";
    ctx.fillRect(obj.x - 20, obj.y + 43, 40, 7);

    // Recharge progress
    ctx.fillStyle = progress >= 1 ? "#75ff65" : "#ffd447";
    ctx.fillRect(
        obj.x - 19,
        obj.y + 44,
        38 * progress,
        5
    );
}
});
// UPDATE AND DRAW ARROWS
for (let i = arrows.length - 1; i >= 0; i--) {
    const arrow = arrows[i];

    arrow.x += Math.cos(arrow.angle) * arrow.speed;
    arrow.y += Math.sin(arrow.angle) * arrow.speed;

    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.angle);

    // Wooden arrow shaft
    ctx.strokeStyle = "#754522";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(16, 0);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = "#d8d8d8";
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(10, -5);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Remove arrows outside the screen
    if (
        arrow.x < 0 || arrow.x > canvas.width ||
        arrow.y < 0 || arrow.y > canvas.height
    ) {
        arrows.splice(i, 1);
    }
}
// SMOOTH FOREST ROOM SLIDE
if (isTransitioning) {
    const elapsed = performance.now() - transitionStartTime;
    transitionProgress = Math.min(1, elapsed / transitionDuration);

    // Smooth acceleration and slowdown
    const smooth = transitionProgress * transitionProgress *
        (3 - 2 * transitionProgress);

    // Which way should the forest slide?
    const direction = transitionDirection;

    // Save the new room's completed picture
    const newRoomPicture = document.createElement("canvas");
    newRoomPicture.width = canvas.width;
    newRoomPicture.height = canvas.height;
    newRoomPicture.getContext("2d").drawImage(canvas, 0, 0);

    // Clear the screen before drawing both rooms
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offset = smooth * canvas.width * direction;

    // Old room slides away
    ctx.drawImage(previousRoomCanvas, -offset, 0);

    // New room slides into view
    ctx.drawImage(
        newRoomPicture,
        canvas.width * direction - offset,
        0
    );

    if (transitionProgress >= 1) {
        isTransitioning = false;
    }
}
    requestAnimationFrame(gameLoop);
}

// Start the game!
gameLoop();