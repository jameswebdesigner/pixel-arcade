
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Our player
const player = {
    x: 60,
    y: 300,
    width: 32,
    height: 32,
    speed: 4,
    velocityY: 0,
    jumping: false
};

// Gravity pulls the player downward
const gravity = 0.5;
const jumpPower = -11;

 // COINS TO COLLECT
const coins = [
    { x: 215, y: 290, collected: false },
    { x: 425, y: 210, collected: false },
    { x: 635, y: 140, collected: false },
    { x: 635, y: 360, collected: false }
];

let score = 0;

// Platforms to jump on
const platforms = [
    { x: 0, y: 410, width: 800, height: 40 },
    { x: 170, y: 330, width: 130, height: 20 },
    { x: 380, y: 250, width: 130, height: 20 },
    { x: 590, y: 180, width: 130, height: 20 }
];

 // DANGEROUS SPIKES!
const spikes = [
    { x: 110, y: 390, width: 30, height: 20 },
    { x: 320, y: 390, width: 30, height: 20 },
    { x: 520, y: 370, width: 60, height: 40 },
    { x: 680, y: 370, width: 60, height: 40 }
];

 // FINISH FLAG
const finishFlag = {
    x: 750,
    y: 340,
    width: 20,
    height: 70
};

let gameWon = false;

// Remember which keys are pressed
const keys = {};

document.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
    }
    keys[event.code] = true;
});

document.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

// Update the player's position
function update() {
    if (gameWon) return;
    if (keys["ArrowRight"]) {
        player.x += player.speed;
    }

    if (keys["ArrowLeft"]) {
        player.x -= player.speed;
    }

    if (keys["Space"] && !player.jumping) {
        player.velocityY = jumpPower;
        player.jumping = true;
    }

    const previousBottom = player.y + player.height;

    player.velocityY += gravity;
    player.y += player.velocityY;

    // Check if player lands on a platform
    for (const platform of platforms) {
        const playerBottom = player.y + player.height;

        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            previousBottom <= platform.y &&
            playerBottom >= platform.y &&
            player.velocityY >= 0
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.jumping = false;
        }
        
// Check if the player touches a coin
for (const coin of coins) {
    if (coin.collected) continue;

    const closestX = Math.max(
        player.x,
        Math.min(coin.x, player.x + player.width)
    );

    const closestY = Math.max(
        player.y,
        Math.min(coin.y, player.y + player.height)
    );

    const distanceX = coin.x - closestX;
    const distanceY = coin.y - closestY;

    if (distanceX ** 2 + distanceY ** 2 < 15 ** 2) {
        coin.collected = true;
        score += 50;
    }
}

    }

    // Keep player inside the screen horizontally
    player.x = Math.max(
        0,
        Math.min(canvas.width - player.width, player.x)
    );

    // Restart if player falls off the screen
    if (player.y > canvas.height) {
        player.x = 60;
        player.y = 300;
        player.velocityY = 0;
        player.jumping = true;
    }
    
// CHECK IF PLAYER TOUCHES A SPIKE
for (const spike of spikes) {

    const spikeHitbox = {
        x: spike.x + 7,
        y: spike.y + 7,
        width: spike.width - 14,
        height: spike.height - 7
    };

    if (
        player.x < spikeHitbox.x + spikeHitbox.width &&
        player.x + player.width > spikeHitbox.x &&
        player.y < spikeHitbox.y + spikeHitbox.height &&
        player.y + player.height > spikeHitbox.y
    ) {
        resetPlayer();
        break;
    }
}

 // Check if EVERY coin has been collected
const allCoinsCollected = coins.every(
    coin => coin.collected
);

// CHECK IF PLAYER REACHES THE FINISH FLAG

if (
    allCoinsCollected &&
    player.x < finishFlag.x + finishFlag.width &&
    player.x + player.width > finishFlag.x &&
    player.y < finishFlag.y + finishFlag.height &&
    player.y + player.height > finishFlag.y
) {
    gameWon = true;
    score += 100;
}


}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = "#42d6ff";

    for (const platform of platforms) {
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );
    }

    // Draw our character
    ctx.fillStyle = "#ffbd4a";
    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );
    
// Draw coins
for (const coin of coins) {
    if (coin.collected) continue;

    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#ffdd00";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Draw score
ctx.fillStyle = "#ffffff";
ctx.font = "bold 24px Arial";
ctx.fillText("SCORE: " + score, 20, 35);

// DRAW RED TRIANGULAR SPIKES
for (const spike of spikes) {
    ctx.beginPath();

    ctx.moveTo(spike.x, spike.y + spike.height);

    ctx.lineTo(
        spike.x + spike.width / 2,
        spike.y
    );

    ctx.lineTo(
        spike.x + spike.width,
        spike.y + spike.height
    );

    ctx.closePath();

    ctx.fillStyle = "#ff425e";
    ctx.fill();

    ctx.strokeStyle = "#ff9aa9";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// DRAW FINISH FLAG
ctx.fillStyle = "#ffffff";
ctx.fillRect(
    finishFlag.x,
    finishFlag.y,
    5,
    finishFlag.height
);

// Draw the flag fabric

 // Red = locked, Green = unlocked
const allCoinsCollected = coins.every(
    coin => coin.collected
);

ctx.fillStyle = allCoinsCollected
    ? "#42ff88"
    : "#ff425e";

ctx.beginPath();
ctx.moveTo(finishFlag.x + 5, finishFlag.y);
ctx.lineTo(finishFlag.x + 45, finishFlag.y + 15);
ctx.lineTo(finishFlag.x + 5, finishFlag.y + 30);
ctx.closePath();
ctx.fill();

// VICTORY SCREEN
if (gameWon) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffbd4a";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        "🏆 LEVEL COMPLETE!",
        canvas.width / 2,
        190
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "28px Arial";
    ctx.fillText(
        "FINAL SCORE: " + score,
        canvas.width / 2,
        250
    );

    ctx.font = "20px Arial";
    ctx.fillText(
        "Refresh to play again!",
        canvas.width / 2,
        310
    );

    ctx.textAlign = "left";
}

// DRAW MUSIC BUTTON
ctx.fillStyle = "#17345b";
ctx.fillRect(
    musicButton.x,
    musicButton.y,
    musicButton.width,
    musicButton.height
);

ctx.strokeStyle = "#42d6ff";
ctx.lineWidth = 2;
ctx.strokeRect(
    musicButton.x,
    musicButton.y,
    musicButton.width,
    musicButton.height
);

ctx.fillStyle = "#ffffff";
ctx.font = "16px Arial";
ctx.textAlign = "center";

ctx.fillText(
    musicEnabled ? "Music: ON" : "Music: OFF",
    musicButton.x + musicButton.width / 2,
    musicButton.y + 24
);

ctx.textAlign = "left";

}

// RESPAWN AFTER HITTING SPIKES

function resetPlayer() {

    // Lose 20 points when you die
    score = Math.max(0, score - 20);

    // Return player to starting position
    player.x = 60;
    player.y = 300;
    player.velocityY = 0;
    player.jumping = true;
}


// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}



// BACKGROUND MUSIC CONTROLS

// BACKGROUND MUSIC CONTROLS
const backgroundMusic = document.getElementById("backgroundMusic");

backgroundMusic.volume = 0.5;

let musicEnabled = true;

// Start music after the first player interaction
function startMusic() {
    if (musicEnabled && backgroundMusic.paused) {
        backgroundMusic.play().catch(() => {
            // Browser may require another interaction
        });
    }
}

// Start when the player presses a key
document.addEventListener("keydown", startMusic);

// MUSIC BUTTON INSIDE GAME CANVAS
const musicButton = {
    x: canvas.width - 135,
    y: 12,
    width: 120,
    height: 36
};

// Click the button to toggle music
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();

    const mouseX = (event.clientX - rect.left) * canvas.width / rect.width;
    const mouseY = (event.clientY - rect.top) * canvas.height / rect.height;

    if (
        mouseX >= musicButton.x &&
        mouseX <= musicButton.x + musicButton.width &&
        mouseY >= musicButton.y &&
        mouseY <= musicButton.y + musicButton.height
    ) {
        musicEnabled = !musicEnabled;

        if (musicEnabled) {
            startMusic();
        } else {
            backgroundMusic.pause();
        }
    } else {
        startMusic();
    }
});
// Start the game after everything is ready
gameLoop();