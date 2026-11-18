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
    if (fallingIntoHole) return;
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
    if (fallingIntoHole) {
    isCharging = false;
    return;
}
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
// SNIP'S RAINBOW COLORS
const snipColors = [
    "#ff3030", // Red
    "#ff9500", // Orange
    "#ffe135", // Yellow
    "#30c850", // Green
    "#3080ff", // Blue
    "#673ab7", // Indigo
    "#a040e8"  // Violet
];
// DRAW SNIP THE FLOWER ENEMY
function drawSnip(snip) {
    const time = performance.now() / 1000;
    // DEFEAT ANIMATION
let fallAngle = 0;
let fadeAmount = 1;

if (snip.defeated) {
    const elapsed = performance.now() - snip.deathTime;
    const progress = Math.min(elapsed / 1000, 1);

    // Tip over 90 degrees
    fallAngle = progress * Math.PI / 2;

    // Slowly disappear
    fadeAmount = 1 - progress;
}

    ctx.save();
    ctx.translate(snip.x, snip.y);

    // Apply falling and fading
ctx.rotate(fallAngle);
ctx.globalAlpha = fadeAmount;

    // Animated root legs
    const wiggle = snip.isMoving
    ? Math.sin(time * 8) * 4
    : 0;

    ctx.strokeStyle = "#79502d";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(-5, 13);
    ctx.lineTo(-12 + wiggle, 28);
    ctx.moveTo(5, 13);
    ctx.lineTo(12 - wiggle, 28);
    ctx.stroke();

    // Six colorful flower petals
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;

        ctx.save();
        ctx.rotate(angle);

        ctx.fillStyle =
    performance.now() - snip.hitTime < 200
        ? "#ff0000"
        : snip.color;
        ctx.strokeStyle = "#24323b";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.ellipse(0, -13, 8, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    // Flower face
    ctx.fillStyle = "#f5dca0";
    ctx.strokeStyle = "#24323b";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = "#192c35";
    ctx.beginPath();
    ctx.arc(-5, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// SNIP ENEMIES
const snips = [];
// SNIP'S FLOWER SEEDS
const snipSeeds = [];

// Shoot one seed toward Forest Blob
function shootSnipSeed(snip) {
    const angle = Math.atan2(
        player.y - snip.y,
        player.x - snip.x
    );

    snipSeeds.push({
        x: snip.x,
        y: snip.y,
        room: snip.room,
        angle: angle,
        speed: 4,
        radius: 5,
        color: "#79502d"
    });
}

// Create a new Snip
function spawnSnip(x, y, room) {
        // Find a safe place away from trees
    const trees = forestRooms[room].trees;

    for (let attempt = 0; attempt < 100; attempt++) {
        const tooClose = trees.some(([treeX, treeY]) =>
            Math.hypot(x - treeX, y - treeY) < 55
        );

        if (!tooClose) break;

        // Try another spot inside the forest
        x = 40 + Math.random() * (canvas.width - 80);
        y = 40 + Math.random() * (canvas.height - 80);
    }
    const snip = {
        x: x,
        y: y,
        room: room,
        color: randomSnipColor(),
health: 2,
hitTime: 0,
isMoving: false,
lastMoveTime: performance.now(),
moveStartTime: 0,
moveDuration: 700,
moveDirectionX: 0,
moveDirectionY: 0,
speed: 3
    };

    snips.push(snip);
}
// SNIP MOVEMENT AI
function updateSnips() {
    const now = performance.now();

    // Remove defeated Snips after their fall animation
for (let i = snips.length - 1; i >= 0; i--) {
    if (
        snips[i].defeated &&
        now - snips[i].deathTime >= 1000
    ) {
        snips.splice(i, 1);
    }
}

    snips.forEach(snip => {
        // Defeated Snips cannot move or shoot
if (snip.defeated) return;
        // Only update Snips in the current room
        if (snip.room !== currentRoom) return;

        // Start moving every 5 seconds
        if (!snip.isMoving && now - snip.lastMoveTime >= 1000) {
            const angleToPlayer = Math.atan2(
                player.y - snip.y,
                player.x - snip.x
            );

            // Random direction generally toward the player
            const randomAngle =
                angleToPlayer + (Math.random() - 0.5) * 1.5;

            snip.moveDirectionX = Math.cos(randomAngle);
            snip.moveDirectionY = Math.sin(randomAngle);

            snip.isMoving = true;
            snip.moveStartTime = now;
        }

        // Move Snip
        if (snip.isMoving) {
            if (now - snip.moveStartTime < snip.moveDuration) {
                // Calculate Snip's next position
const nextX = snip.x + snip.moveDirectionX * snip.speed;
const nextY = snip.y + snip.moveDirectionY * snip.speed;

// Keep Snip inside the forest room
const margin = 30;
// Check whether Snip would hit a tree
const trees = forestRooms[snip.room].trees;

const hitsTree = trees.some(([treeX, treeY]) => {
    const distance = Math.hypot(
        nextX - treeX,
        nextY - treeY
    );

    return distance < 38;
});

if (
    nextX >= margin &&
    nextX <= canvas.width - margin &&
    nextY >= margin &&
    nextY <= canvas.height - margin &&
    !hitsTree
) {
    snip.x = nextX;
    snip.y = nextY;
} else {
    // Snip bumped into a wall!
    snip.isMoving = false;
    snip.lastMoveTime = now;
}
            } else {
    snip.isMoving = false;
    snip.lastMoveTime = now;

    // Fire one seed when Snip stops moving!
    shootSnipSeed(snip);
}
        }
    });
}

// One Snip in each forest room
// Pick one solid color when a Snip spawns
function randomSnipColor() {
    return snipColors[
        Math.floor(Math.random() * snipColors.length)
    ];
 
}

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
let fallingIntoHole = false;
let fallStartTime = 0;
function drawCave() {
    if (currentRoom !== 3) return;

    ctx.fillStyle = "#6b5140";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Rocky cave walls
ctx.fillStyle = "#3d3530";

ctx.fillRect(0, 0, canvas.width, 35);
ctx.fillRect(0, canvas.height - 35, canvas.width, 35);
ctx.fillRect(0, 0, 35, canvas.height);
ctx.fillRect(canvas.width - 35, 0, 35, canvas.height);
// Wooden archery target
ctx.save();
ctx.translate(700, 280);

// Wooden stand
ctx.fillStyle = "#79502d";
ctx.fillRect(-5, 0, 10, 45);

// Target rings
const rings = [
    [30, "#79502d"],
    [26, "#ffffff"],
    [19, "#e53935"],
    [12, "#ffffff"],
    [6, "#e53935"]
];

for (const [radius, color] of rings) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Shooting instructions
ctx.fillStyle = "#ffffff";
ctx.font = "16px Arial";
ctx.textAlign = "center";
ctx.fillText("Shoot the target!", 0, -45);

ctx.restore();
// Tutorial welcome message
ctx.save();
ctx.textAlign = "center";

ctx.fillStyle = "#ffe5ad";
ctx.font = "bold 30px Arial";
ctx.fillText("THE TRAINING CAVE", canvas.width / 2, 85);

ctx.fillStyle = "#ffffff";
ctx.font = "18px Arial";
ctx.fillText("Welcome, Forest Blob!", canvas.width / 2, 115);
ctx.fillText("Use WASD or arrow keys to move, space to roll, and click to shoot", canvas.width / 2, 145);

ctx.restore();
// Glowing blue crystals
const crystals = [
    [80, 80],
    [250, 65],
    [700, 90],
    [820, 400],
    [100, 480]
];

for (const [x, y] of crystals) {
    ctx.save();

    ctx.shadowColor = "#00cfff";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#38d9ff";

    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x - 8, y - 22);
    ctx.lineTo(x, y - 35);
    ctx.lineTo(x + 10, y - 20);
    ctx.lineTo(x + 12, y);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}
    // Scattered cave rocks
for (let i = 0; i < 45; i++) {
    const x = 25 + (i * 137) % (canvas.width - 50);
    const y = 25 + (i * 97) % (canvas.height - 50);
    const size = 4 + (i * 7) % 9;

    // Rock shadow
    ctx.fillStyle = "#49382c";
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 3, size, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gray rock
    ctx.fillStyle = "#85817a";
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rock highlight
    ctx.fillStyle = "#aaa59d";
    ctx.beginPath();
    ctx.ellipse(x - 2, y - 2, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
}
}
function drawTutorialHole() {
    if (currentRoom !== 0) return;

    ctx.save();

    // Dirt rim
    ctx.fillStyle = "#79502d";
    ctx.beginPath();
    ctx.ellipse(450, 350, 40, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark hole
    ctx.fillStyle = "#111510";
    ctx.beginPath();
    ctx.ellipse(450, 347, 32, 21, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
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

        // Round forest blob ghost
ctx.fillStyle = "#008d4b";
ctx.beginPath();
ctx.arc(0, 0, 22, 0, Math.PI * 2);
ctx.fill();

        // Ghost eyes
        ctx.fillStyle = "black";
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
// FALLING INTO THE TUTORIAL HOLE
if (fallingIntoHole) {
    const progress = Math.min(
        (performance.now() - fallStartTime) / 1000,
        1
    );

    // Spin twice
    ctx.rotate(progress * Math.PI * 4);

    // Shrink into the hole
    ctx.scale(1 - progress, 1 - progress);
}
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
// Dark greenish-blue legs
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



    // DARK GREENISH-BLUE ROUND BLOB!
ctx.fillStyle = "#008d4b";
ctx.strokeStyle = "#000000";
ctx.lineWidth = 4;

ctx.beginPath();
ctx.arc(x, y, 22, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();

    
    // Cute black blob eyes
ctx.fillStyle = "#000000";
ctx.beginPath();
ctx.arc(x - 9, y - 3, 6, 0, Math.PI * 2);
ctx.arc(x + 9, y - 3, 6, 0, Math.PI * 2);
ctx.fill();


    // Eyes follow the mouse!
const eyeDX = mouse.x - x;
const eyeDY = mouse.y - y;

const eyeAngle = Math.atan2(eyeDY, eyeDX);

const pupilX = Math.cos(eyeAngle) * 3;
const pupilY = Math.sin(eyeAngle) * 3;

// Moving white eye highlights
ctx.fillStyle = "white";
ctx.beginPath();

ctx.arc(
    x - 9 + pupilX,
    y - 3 + pupilY,
    2,
    0,
    Math.PI * 2
);

ctx.arc(
    x + 9 + pupilX,
    y - 3 + pupilY,
    2,
    0,
    Math.PI * 2
);

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
// FOREST BLOB HEALTH
let playerHealth = 2;
const playerMaxHealth = 2;

// Draw hearts in the top-left corner
function drawHealth() {
    ctx.save();

    ctx.font = "32px Arial";
    ctx.textBaseline = "top";

    for (let i = 0; i < playerMaxHealth; i++) {
        const x = 15 + i * 40;
        const y = 15;

        ctx.fillText(
            playerHealth >= i + 1
    ? "❤️"
    : playerHealth > i
        ? "💔"
        : "🖤",
            x,
            y
        );
    }

    ctx.restore();
}
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
},
{
    name: "Underground Training Cave",
    trees: []
}
];
// Spawn Snips AFTER the forest rooms are created
spawnSnip(350, 250, 1);
spawnSnip(550, 250, 2);
// Remember which keys are being held
const keys = {};

document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    keys[key] = true;
    
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
// GAME OVER SYSTEM
let gameOver = false;

function drawGameOver() {
    // Darken the forest
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";

    // Game Over title
    ctx.fillStyle = "#ff7777";
    ctx.font = "bold 60px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60);

    // Message
    ctx.fillStyle = "#d4f5b0";
    ctx.font = "24px Arial";
    ctx.fillText("THE FOREST WON!", canvas.width / 2, canvas.height / 2);

    // Restart instructions
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Press R to Play Again", canvas.width / 2, canvas.height / 2 + 60);

    ctx.textAlign = "left";
}
function gameLoop() {
    updateSnips();
    // Move Blue Blob
    // BLUE BLOB MOVEMENT AND DODGE ROLL
if (fallingIntoHole) {
    player.x = 450;
    player.y = 350;
    isDodging = false;
} else if (isDodging) {
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
drawCave();
drawTutorialHole();
// Detect when Forest Blob enters the hole
if (currentRoom === 0) {
    const holeDistance = Math.hypot(
        player.x - 450,
        player.y - 350
    );

    if (holeDistance < 20) {
        if (!fallingIntoHole) {
    fallingIntoHole = true;
    fallStartTime = performance.now();
}
// Enter the tutorial after falling
if (fallingIntoHole &&
    performance.now() - fallStartTime >= 1000) {

    currentRoom = 3;

    player.x = 150;
    player.y = 300;

    fallingIntoHole = false;
    isCharging = false;
    isDodging = false;

    arrows.length = 0;
}
    }
}
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
// Add Snips from the current room
snips.forEach(snip => {
    if (snip.room === currentRoom) {
        objects.push({
            type: "snip",
            x: snip.x,
            y: snip.y,
            snip: snip
        });
    }
});

// Draw objects from back to front
objects.sort((a, b) => a.y - b.y);

objects.forEach(obj => {
    if (obj.type === "tree") {
    drawTree(obj.x, obj.y);
} else if (obj.type === "snip") {
    drawSnip(obj.snip);
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
// UPDATE AND DRAW SNIP'S FLOWER SEEDS
for (let i = snipSeeds.length - 1; i >= 0; i--) {
    const seed = snipSeeds[i];

    // Only update seeds in the current room
    if (seed.room !== currentRoom) continue;

    // Move the seed
    seed.x += Math.cos(seed.angle) * seed.speed;
    seed.y += Math.sin(seed.angle) * seed.speed;
    // SEED COLLISION WITH FOREST BLOB
const distanceToPlayer = Math.hypot(
    seed.x - player.x,
    seed.y - player.y
);

if (distanceToPlayer < 25 && !isDodging) {
    // Lose half a heart
    playerHealth = Math.max(0, playerHealth - 0.5);

    // Remove the seed
    snipSeeds.splice(i, 1);

    console.log("Forest Blob health:", playerHealth);

    continue;
}

    // Draw the little brown seed
    ctx.save();
    ctx.translate(seed.x, seed.y);
    ctx.rotate(seed.angle);

    ctx.fillStyle = seed.color;
    ctx.strokeStyle = "#4a301c";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Remove seeds that leave the room
    // SEEDS HAVE A 25% CHANCE TO GROW INTO A SNIP
if (
    seed.x < 0 ||
    seed.x > canvas.width ||
    seed.y < 0 ||
    seed.y > canvas.height
) {
    // Only 1 out of 4 seeds will grow!
    if (Math.random() < 0.25) {

        // Keep the new Snip inside the forest
        const newX = Math.max(40, Math.min(canvas.width - 40, seed.x));
        const newY = Math.max(40, Math.min(canvas.height - 40, seed.y));

        // Grow a new Snip!
        spawnSnip(newX, newY, seed.room);

        console.log("🌱 A new Snip has grown!");
    }

    // Remove the original seed
        snipSeeds.splice(i, 1);
}
} // Close the seed loop

// UPDATE AND DRAW ARROWS
for (let i = arrows.length - 1; i >= 0; i--) {
    const arrow = arrows[i];

    // Move only if the arrow is not stuck
if (!arrow.stuck) {
    arrow.x += Math.cos(arrow.angle) * arrow.speed;
    arrow.y += Math.sin(arrow.angle) * arrow.speed;

    // Check collision with trees in this room
    const trees = forestRooms[currentRoom].trees;

    for (const [treeX, treeY] of trees) {
        // Check the arrowhead, not just the arrow's center
        const tipX = arrow.x + Math.cos(arrow.angle) * 20;
        const tipY = arrow.y + Math.sin(arrow.angle) * 20;

        const distance = Math.hypot(
            tipX - treeX,
            tipY - treeY
        );

        if (distance < 25) {
            arrow.stuck = true;
            arrow.stuckTime = performance.now();
            break;
        }
    }
}

    ctx.save();
    // CHECK IF AN ARROW HITS A SNIP
if (!arrow.stuck) {
    const tipX = arrow.x + Math.cos(arrow.angle) * 20;
    const tipY = arrow.y + Math.sin(arrow.angle) * 20;

    const hitIndex = snips.findIndex(snip =>
        snip.room === currentRoom &&
        Math.hypot(tipX - snip.x, tipY - snip.y) < 25
    );

    if (hitIndex !== -1) {
        const snip = snips[hitIndex];

        snip.health -= 1;
        snip.hitTime = performance.now();
        // Knock Snip backward
const knockX = snip.x + Math.cos(arrow.angle) * 60;
const knockY = snip.y + Math.sin(arrow.angle) * 60;

const hitsTree = forestRooms[snip.room].trees.some(
    ([tx, ty]) => Math.hypot(knockX - tx, knockY - ty) < 38
);

if (!hitsTree &&
    knockX > 30 && knockX < canvas.width - 30 &&
    knockY > 30 && knockY < canvas.height - 30) {
    snip.x = knockX;
    snip.y = knockY;
}

        if (snip.health <= 0) {
    snip.defeated = true;
    snip.deathTime = performance.now();
    snip.isMoving = false;
}

        arrows.splice(i, 1);
        ctx.restore();
        continue;
    }
}
    // Fade stuck arrows over 1.5 seconds
if (arrow.stuck) {
    const elapsed = performance.now() - arrow.stuckTime;
    ctx.globalAlpha = Math.max(0, 1 - elapsed / 1500);

    if (elapsed >= 1500) {
        ctx.restore();
        arrows.splice(i, 1);
        continue;
    }
}
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
// Draw Forest Blob's hearts
drawHealth();

// Check if Forest Blob has been defeated
if (playerHealth <= 0) {
    gameOver = true;
}

// Show Game Over or continue playing
if (gameOver) {
    drawGameOver();
} else {
    requestAnimationFrame(gameLoop);
}
}

// Start the game!
// RESTART GAME WHEN R IS PRESSED
window.addEventListener("keydown", (event) => {
    if (gameOver && event.key.toLowerCase() === "r") {
        location.reload();
    }
});
gameLoop();