
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

 // SCROLLING CAMERA
let cameraX = 0;
let worldWidth = 800;

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
// Which direction Captain Pixel is facing
let facingRight = true;
// Is the game paused?
let gamePaused = false;
// DIMENSIONAL PORTAL OPENING ANIMATION
let portalOpeningStart = null;
let portalTraveling = false;
let portalTravelStart = null;

// OPENING STORY CUTSCENE
let cutscenePlaying = true;
let cutsceneStart = performance.now();

 // PRESS S TO SKIP THE OPENING CUTSCENE
 document.addEventListener("keydown", function(event) {
     if (event.code === "KeyS" && cutscenePlaying) {
        endCutscene();
     }
 });

    // SECRET DEVELOPER MODE
    let developerMode = false;
    let secretInput = "";
    const secretCode = "GALAXY";

    document.addEventListener("keydown", function(event) {
        if (event.repeat) return;

        const key = event.key.toUpperCase();

        // Listen for the secret word PIXEL
        if (/^[A-Z]$/.test(key)) {
            secretInput = (secretInput + key).slice(-secretCode.length);

            if (secretInput === secretCode) {
                developerMode = !developerMode;
                secretInput = "";

                alert(
                    developerMode
                        ? "🚀 DEVELOPER MODE ON! Press 1-5 to skip levels."
                        : "🔒 Developer mode OFF!"
                );
            }
        }

        // Developer level shortcuts
        
        // SECRET LEVEL SKIP!
        if (developerMode && /^[1-5]$/.test(key)) {
            const level = Number(key);

            if (level === 1) {
                // Level 1 is the original starting level
                location.reload();
                return;
            }

            if (level === 2) loadLevel2();
            if (level === 3) loadLevel3();
            if (level === 4) loadLevel4();
            if (level === 5) loadLevel5();

            // Resume gameplay after skipping
            gamePaused = false;
            gameWon = false;

            // Clear old rocket sparks
            rocketParticles = [];

            console.log("Developer jumped to Level " + level);
        }

    });

// Captain Pixel's rocket particles
let rocketParticles = [];
// Gravity pulls the player downward
const gravity = 0.5;
const jumpPower = -11;

 // COINS TO COLLECT
let coins = [
    { x: 215, y: 290, collected: false },
    { x: 425, y: 210, collected: false },
    { x: 635, y: 140, collected: false },
    { x: 613, y: 360, collected: false }
];

let score = 0;

// Platforms to jump on
let platforms = [
    { x: 0, y: 410, width: 800, height: 40 },
    { x: 170, y: 330, width: 130, height: 20 },
    { x: 380, y: 250, width: 130, height: 20 },
    { x: 590, y: 180, width: 130, height: 20 }
];

 // DANGEROUS SPIKES!
let spikes = [
    { x: 110, y: 390, width: 30, height: 20 },
    { x: 320, y: 390, width: 30, height: 20 },
    { x: 520, y: 370, width: 60, height: 40 },
    { x: 660, y: 370, width: 60, height: 40 }
];

 // FINISH FLAG
const finishFlag = {
    x: 750,
    y: 340,
    width: 20,
    height: 70
};

let gameWon = false;
// Which level is the player on?
let currentLevel = 1;

 // OUR FIRST ENEMY!
const alien = {
    x: 550,
    y: 380,
    width: 30,
    height: 30,
    speed: 2
};

 // CORP - THE LEVEL 4 ENEMY

const corp = {
    x: 550,
    y: 378,
    width: 32,
    height: 32,
    speed: 1.8,
    defeated: false
};


// Remember which keys are pressed
const keys = {};

document.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
        
document.addEventListener("keydown", function(event) {
    if (event.code === "KeyP" && !event.repeat) {
        gamePaused = !gamePaused;
    }
});

    }
    keys[event.code] = true;
});

document.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

// Update the player's position
function update() {
    if (gameWon) return;
    if (keys["ArrowRight"] && !portalTraveling) {
        player.x += player.speed;
        facingRight = true;
    }

    if (keys["ArrowLeft"] && !portalTraveling) {
        player.x -= player.speed;
        facingRight = false;
    }

    if (keys["Space"] && !player.jumping && !portalTraveling) {
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
if (coin.collected || coin.hidden) continue;

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
    
 // Keep the player inside the WORLD, not just the screen
player.x = Math.max(
    0,
    Math.min(worldWidth - player.width, player.x)
);

// Make the camera follow on scrolling levels
if (currentLevel === 5) {
    cameraX = Math.max(
        0,
        Math.min(
            worldWidth - canvas.width,
            player.x - canvas.width / 2
        )
    );
} else {
    cameraX = 0;
}


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

 // CORP COLLISION
if (currentLevel === 4 && !corp.defeated) {

    // CORP CHASES THE PLAYER!
    if (corp.x < player.x) {
        corp.x += corp.speed;
    } else if (corp.x > player.x) {
        corp.x -= corp.speed;
    }

    const touchingCorp =
        player.x < corp.x + corp.width &&
        player.x + player.width > corp.x &&
        player.y < corp.y + corp.height &&
        player.y + player.height > corp.y;

    if (touchingCorp) {

        // Did the player land on CORP's head?
        const landedOnHead =
            player.velocityY >= 0 &&
            previousBottom <= corp.y + 12;

        if (landedOnHead) {

            // CORP is defeated!
            corp.defeated = true;

            // Bounce the player upward
            player.velocityY = -14;
            player.jumping = true;

            
    // Drop the secret coin where Corp was defeated!
    coins[0].x = corp.x + corp.width / 2 - 10;
    coins[0].y = corp.y - 25;

    // Reveal the coin
    coins[0].hidden = false;


        } else {

            // Touching CORP from the side is dangerous!
            resetPlayer();
        }
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
 
    // Start Captain Pixel's portal journey!
if (!portalTraveling) {
    portalTraveling = true;
    portalTravelStart = performance.now();
    score += 100;
}

    

// Wait 1.2 seconds before changing levels
if (performance.now() - portalTravelStart >= 1200) {
if (currentLevel === 1) {
    loadLevel2();
} else if (currentLevel === 2) {
    loadLevel3();
} else if (currentLevel === 3) {
    loadLevel4();
} else if (currentLevel === 4) {
    loadLevel5();
} else {
    gameWon = true;
}



} // End portal travel timer
    } // End portal travel timer

 // End portal collision check



 // ALIEN CHASE BEHAVIOR
if (currentLevel === 3 && !gameWon && !portalTraveling) {

    // Move toward the player
    if (alien.x < player.x) {
        alien.x += alien.speed;
    } else if (alien.x > player.x) {
        alien.x -= alien.speed;
    }

    // Check if the alien catches the player
    if (
        player.x < alien.x + alien.width &&
        player.x + player.width > alien.x &&
        player.y < alien.y + alien.height &&
        player.y + player.height > alien.y
    ) {
        resetPlayer();

        // Reset alien so the player has time to escape
        alien.x = 550;
    }
}

}

// Draw everything

function updateRocketParticles() {

    // Create sparks while Captain Pixel is jumping
    if (player.jumping) {
        for (let i = 0; i < 2; i++) {
            rocketParticles.push({
                x: player.x + 10 + Math.random() * 12,
                y: player.y + player.height,
                vx: (Math.random() - 0.5) * 2,
                vy: 1 + Math.random() * 2,
                life: 25,
                size: 0.5 + Math.random() * 1
            });
        }
    }

    // Move and fade existing sparks
    for (let i = rocketParticles.length - 1; i >= 0; i--) {
        const p = rocketParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.life <= 0) {
            rocketParticles.splice(i, 1);
        }
    }
}

function draw() {

    // SPACE ADVENTURE - STAR BACKGROUND
    ctx.fillStyle = "#071329";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw distant stars
    for (let i = 0; i < 65; i++) {
        const starX = (i * 137 + 29) % canvas.width;
        const starY = (i * 79 + 17) % canvas.height;

        ctx.fillStyle = i % 4 === 0
            ? "#42d6ff"
            : "#ffffff";

        const starSize = i % 5 === 0 ? 3 : 2;

        ctx.fillRect(starX, starY, starSize, starSize);
    }

    // DIMENSIONAL RIPS IN THE GAME BACKGROUND
    const spaceRips = [
        { x: 110, y: 130, size: 28 },
        { x: 350, y: 190, size: 22 },
        { x: 690, y: 105, size: 35 },
        { x: 220, y: 315, size: 25 },
        { x: 560, y: 330, size: 30 }
    ];

    for (let i = 0; i < spaceRips.length; i++) {
        const rip = spaceRips[i];

        // Make the cracks slowly flicker
        const flicker =
            0.7 + Math.sin(Date.now() / 400 + i * 2) * 0.3;

        ctx.save();
        ctx.globalAlpha = flicker;
        ctx.strokeStyle = "#b56aff";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#a66bff";
        ctx.shadowBlur = 15;

        // Draw a jagged crack
        ctx.beginPath();
        ctx.moveTo(rip.x, rip.y);
        ctx.lineTo(rip.x + 6, rip.y + rip.size * 0.3);
        ctx.lineTo(rip.x - 4, rip.y + rip.size * 0.6);
        ctx.lineTo(rip.x + 8, rip.y + rip.size * 0.8);
        ctx.lineTo(rip.x + 2, rip.y + rip.size);
        ctx.stroke();

        // Bright glowing center
        ctx.strokeStyle = "#e8c7ff";
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.stroke();

        ctx.restore();
    }

    // GIANT ALIEN PLANET
    // Moves slowly when the camera scrolls
    const planetX = 620 - cameraX * 0.2;
    const planetY = 115;
    const planetRadius = 65;

    // Purple glow around the planet
    const glow = ctx.createRadialGradient(
        planetX, planetY, 35,
        planetX, planetY, 105
    );

    glow.addColorStop(0, "rgba(155, 92, 255, 0.5)");
    glow.addColorStop(1, "rgba(155, 92, 255, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(planetX, planetY, 105, 0, Math.PI * 2);
    ctx.fill();

    // Planet surface
    ctx.fillStyle = "#8454d6";
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
    ctx.fill();

    // Planet highlight
    ctx.fillStyle = "rgba(210, 175, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(planetX - 18, planetY - 20, 25, 0, Math.PI * 2);
    ctx.fill();

    // Small planet craters
    ctx.fillStyle = "rgba(55, 30, 110, 0.35)";

    ctx.beginPath();
    ctx.arc(planetX + 25, planetY + 15, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(planetX - 20, planetY + 30, 8, 0, Math.PI * 2);
    ctx.fill();

 // Move the game world opposite the camera

ctx.save();
ctx.translate(-cameraX, 0);

    
    // GLOWING SPACE PLATFORMS!
    for (const platform of platforms) {
        ctx.save();

        // Electric blue glow
        ctx.shadowColor = "#42d6ff";
        ctx.shadowBlur = 12;

        // Dark metallic platform
        ctx.fillStyle = "#182b49";
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );

        // Bright neon top edge
        ctx.fillStyle = "#42d6ff";
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            4
        );

        // Small futuristic lights
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#65eaff";

        for (
            let x = platform.x + 12;
            x < platform.x + platform.width - 5;
            x += 28
        ) {
            ctx.fillRect(
                x,
                platform.y + platform.height - 5,
                10,
                3
            );
        }

        ctx.restore();
    }



   
    // DRAW CAPTAIN PIXEL'S ROCKET TRAIL
    for (const p of rocketParticles) {
        ctx.globalAlpha = p.life / 25;

        // Outer blue glow
        ctx.fillStyle = "#2254ff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Bright cyan center
        ctx.fillStyle = "#42d6ff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Restore normal transparency
    ctx.globalAlpha = 1;

    // CAPTAIN PIXEL - ASTRONAUT!
    
ctx.save();

// PORTAL TRAVEL ANIMATION
const travelProgress = portalTraveling
    ? Math.min((performance.now() - portalTravelStart) / 1200, 1)
    : 0;
    // SPIN AND SHRINK INTO THE PORTAL!

if (portalTraveling) {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;

    // Find the center of the dimensional portal
    const targetX = finishFlag.x + 5;
    const targetY = finishFlag.y + 35;

    // Pull Captain Pixel toward the portal
    const pullX = (targetX - centerX) * travelProgress;
    const pullY = (targetY - centerY) * travelProgress;

    ctx.translate(pullX, pullY);

    // Spin and shrink!
    ctx.translate(centerX, centerY);
    ctx.rotate(travelProgress * Math.PI * 4);

    const shrink = Math.max(0.01, 1 - travelProgress);
    ctx.scale(shrink, shrink);

    ctx.translate(-centerX, -centerY);
}

if (facingRight) {
    ctx.translate(player.x, player.y);
    ctx.scale(player.width / 32, player.height / 32);
} else {
    ctx.translate(player.x + player.width, player.y);
    ctx.scale(-player.width / 32, player.height / 32);
}

    // CAPTAIN PIXEL'S SPACE WADDLE!
    const captainWalking =
        !player.jumping &&
        (keys["ArrowLeft"] || keys["ArrowRight"]);

    if (captainWalking) {
        
const captainWobble =
    Math.sin(Date.now() / 130) * 0.18;

const captainSquish =
    Math.sin(Date.now() / 130) * 0.16;


        // Keep his feet planted while he wobbles
        ctx.translate(16, 32);

        // Rock side to side
        ctx.rotate(captainWobble);

        // Squish and stretch
        ctx.scale(
            1 - captainSquish * 0.5,
            1 + captainSquish
        );

        ctx.translate(-16, -32);
    }

    
    // DUAL ROCKET BOOSTERS!
    if (player.jumping) {
        const flameLength = 9 + Math.random() * 7;

        // Left booster flame
        ctx.fillStyle = "#2254ff";
        ctx.beginPath();
        ctx.moveTo(8, 27);
        ctx.lineTo(11, 27 + flameLength);
        ctx.lineTo(14, 27);
        ctx.fill();

        // Right booster flame
        ctx.beginPath();
        ctx.moveTo(19, 27);
        ctx.lineTo(22, 27 + flameLength);
        ctx.lineTo(25, 27);
        ctx.fill();

        // Bright cyan flame centers
        ctx.fillStyle = "#42d6ff";
        ctx.beginPath();
        ctx.moveTo(10, 27);
        ctx.lineTo(11, 27 + flameLength * 0.65);
        ctx.lineTo(12, 27);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(21, 27);
        ctx.lineTo(22, 27 + flameLength * 0.65);
        ctx.lineTo(23, 27);
        ctx.fill();
    }


    // Backpack
    ctx.fillStyle = "#7b8da8";
    ctx.fillRect(1, 13, 30, 16);

    // Space suit
    ctx.fillStyle = "#e8edf7";
    ctx.fillRect(6, 13, 20, 14);

    // Arms
    ctx.fillStyle = "#c2d2e5";
    ctx.fillRect(2, 15, 5, 12);
    ctx.fillRect(25, 15, 5, 12);

    
    // WALKING ANIMATION!
    // Check whether the player is moving on the ground
    const walking =
        !player.jumping &&
        (keys["ArrowLeft"] || keys["ArrowRight"]);

    // Make the legs swing back and forth
    const step = walking
        ? Math.sin(Date.now() / 90) * 4
        : 0;

    // Animated boots
    ctx.fillStyle = "#8096b5";
    ctx.fillRect(7 + step, 27, 8, 5);
    ctx.fillRect(17 - step, 27, 8, 5);

    // Helmet
    ctx.fillStyle = "#f1f5ff";
    ctx.beginPath();
    ctx.arc(16, 12, 12, 0, Math.PI * 2);
    ctx.fill();

    
    // SIDE-PROFILE HELMET VISOR
    // The visor points toward the astronaut's front
    ctx.fillStyle = "#153e70";
    ctx.beginPath();
    ctx.roundRect(14, 7, 15, 12, 5);
    ctx.fill();

    // Bright cyan visor reflection
    ctx.fillStyle = "#42d6ff";
    ctx.fillRect(20, 9, 6, 3);

    // Small helmet detail on the back
    ctx.fillStyle = "#8096b5";
    ctx.fillRect(3, 10, 5, 7);


    // Suit control panel
    ctx.fillStyle = "#42d6ff";
    ctx.fillRect(13, 18, 6, 5);

    ctx.restore();

    
// Draw coins
for (const coin of coins) {
if (coin.collected || coin.hidden) continue;

    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#ffdd00";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
}

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




    // DIMENSIONAL RIP / PORTAL
    const allCoinsCollected = coins.every(
        coin => coin.collected
    );

    const portalX = finishFlag.x + 5;
    const portalY = finishFlag.y + 35;
    const pulse = Math.sin(Date.now() / 250);
// Start the opening animation when the last coin is collected
if (allCoinsCollected && portalOpeningStart === null) {
    portalOpeningStart = performance.now();
}

// How far has the portal opened? 0 = closed, 1 = fully open
const portalProgress = allCoinsCollected
    ? Math.min((performance.now() - portalOpeningStart) / 1500, 1)
    : 0;
    ctx.save();

    if (!allCoinsCollected) {
        // LOCKED: a jagged red crack in space
        ctx.strokeStyle = "#ff425e";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#ff425e";
        ctx.shadowBlur = 12 + pulse * 5;

        ctx.beginPath();
        ctx.moveTo(portalX, portalY - 30);
        ctx.lineTo(portalX + 8, portalY - 17);
        ctx.lineTo(portalX - 4, portalY);
        ctx.lineTo(portalX + 9, portalY + 14);
        ctx.lineTo(portalX, portalY + 30);
        ctx.stroke();

    } else {
        // UNLOCKED: a glowing swirling portal!
        // Grow the portal from the center
ctx.translate(portalX, portalY);
ctx.scale(
    Math.max(0.05, portalProgress),
    Math.max(0.05, portalProgress)
);
ctx.translate(-portalX, -portalY);
        ctx.shadowColor = "#42d6ff";
        ctx.shadowBlur = 18 + pulse * 6;

        // Purple outer portal
        ctx.fillStyle = "#7136b4";
        ctx.beginPath();
        ctx.ellipse(
            portalX, portalY,
            19, 31, 0, 0, Math.PI * 2
        );
        ctx.fill();

        // Blue center
        ctx.fillStyle = "#153e83";
        ctx.beginPath();
        ctx.ellipse(
            portalX, portalY,
            14, 26, 0, 0, Math.PI * 2
        );
        ctx.fill();

        
    // SWIRLING DIMENSIONAL ENERGY!
    const swirlTime = Date.now() / 400;

    // Blue energy particles orbit the portal
    for (let i = 0; i < 12; i++) {
        const angle = swirlTime + i * Math.PI * 2 / 12;

        const sparkX = portalX + Math.cos(angle) * 17;
        const sparkY = portalY + Math.sin(angle) * 29;

        ctx.fillStyle = i % 2 === 0
            ? "#42d6ff"
            : "#d2a6ff";

        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Rotating broken energy ring
    ctx.strokeStyle = "#42d6ff";
    ctx.lineWidth = 2;
    ctx.setLineDash([9, 7]);
    ctx.lineDashOffset = -swirlTime * 5;

    ctx.beginPath();
    ctx.ellipse(
        portalX, portalY,
        17, 29,
        0,
        0, Math.PI * 2
    );
    ctx.stroke();

    // Return to solid lines
    ctx.setLineDash([]);


        // Pulsing energy core
        ctx.fillStyle = "#a5f3ff";
        ctx.globalAlpha = 0.5 + pulse * 0.2;
        ctx.beginPath();
        ctx.ellipse(
            portalX, portalY,
            7, 17, 0, 0, Math.PI * 2
        );
        ctx.fill();
    }

    ctx.restore();


ctx.restore(); // Stop moving the camera

 // Draw score in a fixed position on the screen
ctx.fillStyle = "#ffffff";
ctx.font = "bold 24px Arial";
ctx.textAlign = "left";
ctx.fillText("SCORE: " + score, 20, 35);


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

 // DISPLAY CURRENT LEVEL
ctx.fillStyle = "#ffffff";
ctx.font = "bold 24px Arial";
ctx.textAlign = "center";

ctx.fillText(
    "LEVEL " + currentLevel,
    canvas.width / 2,
    35
);

ctx.textAlign = "left";

 // DRAW ZORP ON LEVEL 3
if (currentLevel === 3) {

 // DRAW THE ALIEN ON LEVEL 3
if (currentLevel === 3) {

    
    
    // ZORP'S WOBBLING BODY!
    // Smooth alien waddle
const zorpWobble = Math.sin(Date.now() / 350) * 0.08;
const zorpSquish = Math.sin(Date.now() / 180) * 0.12;
    // Start moving the WHOLE alien
   ctx.save();

// Rotate Zorp around the bottom center of his body
ctx.translate(
    alien.x + alien.width / 2,
    alien.y + alien.height
);

ctx.rotate(zorpWobble);
// Squish shorter and wider, then stretch taller
ctx.scale(
    1 - zorpSquish * 0.5,
    1 + zorpSquish
);
ctx.translate(
    -(alien.x + alien.width / 2),
    -(alien.y + alien.height)
);
    // Purple alien body
    ctx.fillStyle = "#a66bff";
    ctx.fillRect(
        alien.x,
        alien.y,
        alien.width,
        alien.height
    );



    // Where is the player compared to the alien?
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    const alienCenterX = alien.x + alien.width / 2;
    const alienCenterY = alien.y + alien.height / 2;

    // Calculate the direction to look
    const dx = playerCenterX - alienCenterX;
    const dy = playerCenterY - alienCenterY;

    const distance = Math.hypot(dx, dy) || 1;

    // Move pupils up to 2 pixels in that direction
    const eyeOffsetX = (dx / distance) * 2;
    const eyeOffsetY = (dy / distance) * 2;

    // White eyes
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(alien.x + 5, alien.y + 8, 7, 7);
    ctx.fillRect(alien.x + 18, alien.y + 8, 7, 7);

    // Pupils that FOLLOW THE PLAYER!
    ctx.fillStyle = "#091a37";

    ctx.fillRect(
        alien.x + 7 + eyeOffsetX,
        alien.y + 10 + eyeOffsetY,
        3,
        3
    );

    ctx.fillRect(
        alien.x + 20 + eyeOffsetX,
        alien.y + 10 + eyeOffsetY,
        3,
        3
    );
}

 // DISPLAY ZORP'S NAME
ctx.fillStyle = "#ffffff";
ctx.font = "bold 14px Arial";
ctx.textAlign = "center";

ctx.fillText(
    "ZORP",
    alien.x + alien.width / 2,
    alien.y - 12
);

ctx.textAlign = "left";
ctx.restore();
}

 // DRAW CORP
if (currentLevel === 4 && !corp.defeated) {

    // CORP'S WOBBLY WALK!
    const corpWobble = Math.sin(Date.now() / 350) * 0.08;
    const corpSquish = Math.sin(Date.now() / 180) * 0.12;

    ctx.save();

    // Rotate and squish around Corp's feet
    ctx.translate(
        corp.x + corp.width / 2,
        corp.y + corp.height
    );

    ctx.rotate(corpWobble);

    ctx.scale(
        1 - corpSquish * 0.5,
        1 + corpSquish
    );

    ctx.translate(
        -(corp.x + corp.width / 2),
        -(corp.y + corp.height)
    );

    // Orange body
    ctx.fillStyle = "#ff7043";
    ctx.fillRect(
        corp.x,
        corp.y,
        corp.width,
        corp.height
    );

    
    // CORP'S TRACKING EYES!

    // Find the center of the player
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    // Find the center of CORP
    const corpCenterX = corp.x + corp.width / 2;
    const corpCenterY = corp.y + corp.height / 2;

    // Which direction is the player?
    const dx = playerCenterX - corpCenterX;
    const dy = playerCenterY - corpCenterY;

    // Calculate distance
    const distance = Math.hypot(dx, dy) || 1;

    // Move pupils toward the player
    const eyeOffsetX = (dx / distance) * 2;
    const eyeOffsetY = (dy / distance) * 2;

    // White eyes
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(corp.x + 5, corp.y + 8, 7, 7);
    ctx.fillRect(corp.x + 20, corp.y + 8, 7, 7);

    // Moving pupils!
    ctx.fillStyle = "#091a37";

    ctx.fillRect(
        corp.x + 7 + eyeOffsetX,
        corp.y + 10 + eyeOffsetY,
        3,
        3
    );

    ctx.fillRect(
        corp.x + 22 + eyeOffsetX,
        corp.y + 10 + eyeOffsetY,
        3,
        3
    );

    // Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        "CORP",
        corp.x + corp.width / 2,
        corp.y - 12
    );
    ctx.textAlign = "left";
    ctx.restore();
}

// LEVEL INSTRUCTIONS
let instructions = "";

if (currentLevel === 1 || currentLevel === 2) {
    instructions = "Collect all coins to unlock the flag! BUT! Don't hit a spike!";
} else if (currentLevel === 3) {
    instructions = "DODGE ZORP! Jump over him and reach the flag!";
} else if (currentLevel === 4) {
    instructions = "JUMP ON CORP! Collect his coin to unlock the flag!";
}

// Draw instructions
ctx.fillStyle = "#ffbd4a";
ctx.font = "bold 16px Arial";
ctx.textAlign = "center";

ctx.fillText(
    instructions,
    canvas.width / 2,
    75
);

ctx.textAlign = "left";

 
    // CAPTAIN PIXEL'S PAUSE MENU
    if (gamePaused) {
        ctx.save();

        // Dark transparent background
        ctx.fillStyle = "rgba(0, 8, 25, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Big pause title
        ctx.fillStyle = "#42d6ff";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            "GAME PAUSED",
            canvas.width / 2,
            canvas.height / 2 - 20
        );

        // Resume message
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px Arial";
        ctx.fillText(
            "PRESS P TO RESUME",
            canvas.width / 2,
            canvas.height / 2 + 30
        );

        ctx.restore();
    }

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


 // LOAD LEVEL 2
function loadLevel2() {
    portalOpeningStart = null;
    portalTraveling = false;
portalTravelStart = null;
    currentLevel = 2;
    gameWon = false;
worldWidth = 800;
cameraX = 0;
finishFlag.x = 750;
    // New platforms!
    platforms = [
        { x: 0, y: 410, width: 800, height: 40 },
        { x: 130, y: 330, width: 130, height: 20 },
        { x: 310, y: 250, width: 130, height: 20 },
        { x: 490, y: 330, width: 130, height: 20 },
        { x: 650, y: 250, width: 130, height: 20 }
    ];

    // Four coins to collect
    coins = [
        { x: 190, y: 290, collected: false },
        { x: 370, y: 210, collected: false },
        { x: 550, y: 290, collected: false },
        { x: 710, y: 210, collected: false }
    ];

    // More dangerous spikes!
    spikes = [
        { x: 100, y: 390, width: 40, height: 20 },
        { x: 280, y: 390, width: 40, height: 20 },
        { x: 450, y: 390, width: 40, height: 20 },
        { x: 630, y: 390, width: 40, height: 20 }
    ];

    // Reset the character
    player.x = 60;
    player.y = 300;
    player.velocityY = 0;
    player.jumping = true;

    // Keep the score earned in Level 1!
}

 // LEVEL 3: FIRST CONTACT!
function loadLevel3() {
    portalOpeningStart = null;
    portalTraveling = false;
portalTravelStart = null;
    currentLevel = 3;
    gameWon = false;
worldWidth = 800;
cameraX = 0;
finishFlag.x = 750;
 // Put the alien at its starting position
alien.x = 550;
alien.y = 380;

    // Just one flat floor
    platforms = [
        { x: 0, y: 410, width: 800, height: 40 }
    ];

    // No coins or spikes!
    coins = [];
    spikes = [];

    // Start at the beginning
    player.x = 60;
    player.y = 300;
    player.velocityY = 0;
    player.jumping = true;
}

 // LEVEL 4 - CORP'S REVENGE
function loadLevel4() {
    portalOpeningStart = null;
    portalTraveling = false;
portalTravelStart = null;
    currentLevel = 4;
    gameWon = false;
worldWidth = 800;
cameraX = 0;
finishFlag.x = 750;
    // One flat floor
    platforms = [
        { x: 0, y: 410, width: 800, height: 40 }
    ];

    // CORP will drop the only coin
    coins = [
        { x: 416, y: 365, collected: false, hidden: true }
    ];

    spikes = [];

    // Reset CORP
    corp.x = 550;
    corp.y = 378;
    corp.defeated = false;

    // Reset player
    player.x = 60;
    player.y = 300;
    player.velocityY = 0;
    player.jumping = true;
}

 // LEVEL 5 - BEYOND THE BORDER!
function loadLevel5() {
    portalOpeningStart = null;
    portalTraveling = false;
portalTravelStart = null;
    currentLevel = 5;
    gameWon = false;

    // THREE screens wide!
    worldWidth = 2400;
    cameraX = 0;

    // A long floor and new platforms
    platforms = [
        { x: 0, y: 410, width: 2400, height: 40 },
        { x: 200, y: 330, width: 130, height: 20 },
        { x: 480, y: 250, width: 130, height: 20 },
        { x: 800, y: 330, width: 130, height: 20 },
        { x: 1100, y: 250, width: 130, height: 20 },
        { x: 1450, y: 330, width: 130, height: 20 },
        { x: 1800, y: 250, width: 130, height: 20 },
        { x: 2100, y: 330, width: 130, height: 20 }
    ];

    // Coins spread across the entire world
    coins = [
        { x: 265, y: 290, collected: false },
        { x: 545, y: 210, collected: false },
        { x: 865, y: 290, collected: false },
        { x: 1165, y: 210, collected: false },
        { x: 1515, y: 290, collected: false },
        { x: 1865, y: 210, collected: false },
        { x: 2165, y: 290, collected: false }
    ];

    // Spikes to jump over
    spikes = [
        { x: 380, y: 390, width: 40, height: 20 },
        { x: 700, y: 390, width: 40, height: 20 },
        { x: 1000, y: 390, width: 40, height: 20 },
        { x: 1350, y: 390, width: 40, height: 20 },
        { x: 1700, y: 390, width: 40, height: 20 },
        { x: 2000, y: 390, width: 40, height: 20 }
    ];

    // Move the finish flag to the end of the world
    finishFlag.x = 2330;

    // Reset the player
    player.x = 60;
    player.y = 300;
    player.velocityY = 0;
    player.jumping = true;
}

// Game loop

function gameLoop() {
    if (cutscenePlaying) {
        // Play the opening movie instead of the game
        drawOpeningCutscene();
    } else {
        // Play the normal game
        if (!gamePaused) {
            update();
            updateRocketParticles();
        }

        draw();
    }

    requestAnimationFrame(gameLoop);
}




// BACKGROUND MUSIC CONTROLS

// BACKGROUND MUSIC CONTROLS
const backgroundMusic = document.getElementById("backgroundMusic");
// Music for Captain Pixel's opening movie
const cutsceneMusic = new Audio("audio/cutscene-music.mp3");
cutsceneMusic.volume = 0.5;
cutsceneMusic.loop = true;
backgroundMusic.volume = 0.5;

let musicEnabled = true;

// Start music after the first player interaction

function startMusic() {
    if (!musicEnabled) return;

    if (cutscenePlaying) {
        // Play Andromida during the opening movie
        backgroundMusic.pause();

        if (cutsceneMusic.paused) {
            cutsceneMusic.play().catch(() => {
                // Browser may require another interaction
            });
        }
    } else {
        // Switch to regular gameplay music
        cutsceneMusic.pause();
        cutsceneMusic.currentTime = 0;

        if (backgroundMusic.paused) {
            backgroundMusic.play().catch(() => {
                // Browser may require another interaction
            });
        }
    }
}
// END THE CUTSCENE AND SWITCH MUSIC
function endCutscene() {
    cutscenePlaying = false;

    // Stop Andromida
    cutsceneMusic.pause();
    cutsceneMusic.currentTime = 0;

    // Start regular gameplay music
    startMusic();
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

 // CAPTAIN PIXEL: THE DIMENSIONAL INVASION
 function drawOpeningCutscene() {
     const elapsed = (performance.now() - cutsceneStart) / 1000;

     // Each scene has its own part of the story
     const scenes = [
         {
             title: "A GALAXY AT PEACE",
             story: "For centuries, the stars lived in harmony."
         },
         {
             title: "THE DIMENSIONAL RIFT",
             story: "Until a mysterious portal tore open space..."
         },
         {
             title: "THE INVASION",
             story: "Zorp, Corp, and their evil clones arrived!"
         },
         {
             title: "THE LAST HOPE",
             story: "The galaxy needed one brave astronaut."
         },
         {
             title: "CAPTAIN PIXEL",
             story: "Chosen to stop the invaders and save the stars!"
         },
         {
             title: "THE MISSION BEGINS",
             story: "Defeat the aliens. Close the rift. Save the galaxy!"
         }
     ];

     const sceneDuration = 5;
     const sceneIndex = Math.floor(elapsed / sceneDuration);

     // Start Level 1 when the movie ends
     if (sceneIndex >= scenes.length) {
         endCutscene();
         return;
     }

     const sceneTime = elapsed % sceneDuration;
     const scene = scenes[sceneIndex];

     ctx.save();

     // Deep space background
     ctx.fillStyle = "#03091e";
     ctx.fillRect(0, 0, canvas.width, canvas.height);

     // Twinkling stars
     for (let i = 0; i < 100; i++) {
         const x = (i * 137 + 23) % canvas.width;
         const y = (i * 83 + 41) % canvas.height;
         const twinkle = 0.4 + Math.abs(
             Math.sin(elapsed * 2 + i)
         ) * 0.6;

         ctx.globalAlpha = twinkle;
         ctx.fillStyle = i % 5 === 0 ? "#42d6ff" : "#ffffff";
         ctx.fillRect(x, y, 2, 2);
     }

     ctx.globalAlpha = 1;

    // LITTLE DIMENSIONAL RIPS IN SPACE
    if (sceneIndex >= 0) {
        const rips = [
            { x: 120, y: 155, size: 25 },
            { x: 680, y: 120, size: 32 },
            { x: 180, y: 290, size: 20 },
            { x: 620, y: 310, size: 28 },
            { x: 520, y: 165, size: 16 }
        ];

        rips.forEach((rip, i) => {
            const flicker =
                0.65 + Math.sin(elapsed * 3 + i * 2) * 0.25;

            ctx.save();
            ctx.globalAlpha = flicker;
            ctx.strokeStyle = "#b56aff";
            ctx.lineWidth = 2;
            ctx.shadowColor = "#a66bff";
            ctx.shadowBlur = 12;

            // Jagged crack through space
            ctx.beginPath();
            ctx.moveTo(rip.x, rip.y);
            ctx.lineTo(rip.x + 5, rip.y + rip.size * 0.3);
            ctx.lineTo(rip.x - 3, rip.y + rip.size * 0.55);
            ctx.lineTo(rip.x + 7, rip.y + rip.size * 0.8);
            ctx.lineTo(rip.x + 2, rip.y + rip.size);
            ctx.stroke();

            // Bright center of the crack
            ctx.strokeStyle = "#e8c7ff";
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
            ctx.stroke();

            ctx.restore();
        });
    }

     // Purple dimensional portal during the invasion
     if (sceneIndex === 1 || sceneIndex === 2) {
         const pulse = Math.sin(elapsed * 4) * 12;

         ctx.shadowColor = "#a66bff";
         ctx.shadowBlur = 35;

         ctx.strokeStyle = "#a66bff";
         ctx.lineWidth = 12;
         ctx.beginPath();
         ctx.ellipse(
             400, 210,
             95 + pulse, 120 + pulse,
             0, 0, Math.PI * 2
         );
         ctx.stroke();

         ctx.shadowBlur = 0;

         ctx.fillStyle = "rgba(100, 30, 180, 0.35)";
         ctx.beginPath();
         ctx.ellipse(400, 210, 85, 110, 0, 0, Math.PI * 2);
         ctx.fill();
     }

     // Zorp and Corp appear during the invasion
     if (sceneIndex === 2) {
         const bob = Math.sin(elapsed * 4) * 8;

         // Zorp
         ctx.fillStyle = "#a66bff";
         ctx.fillRect(280, 230 + bob, 45, 45);

         // Corp
         ctx.fillStyle = "#ff7043";
         ctx.fillRect(470, 230 - bob, 45, 45);

         // Alien eyes
         ctx.fillStyle = "#ffffff";
         ctx.fillRect(289, 242 + bob, 10, 10);
         ctx.fillRect(306, 242 + bob, 10, 10);
         ctx.fillRect(479, 242 - bob, 10, 10);
         ctx.fillRect(496, 242 - bob, 10, 10);
     }

     // Captain Pixel launches into space!
     if (sceneIndex === 4 || sceneIndex === 5) {
         const rocketY = 250 - Math.sin(elapsed * 2) * 12;

         // Blue booster flame
         ctx.fillStyle = "#42d6ff";
         ctx.beginPath();
         ctx.moveTo(390, rocketY + 32);
         ctx.lineTo(400, rocketY + 75);
         ctx.lineTo(410, rocketY + 32);
         ctx.fill();

         // Astronaut body
         ctx.fillStyle = "#e8edf7";
         ctx.fillRect(384, rocketY, 32, 35);

         // Helmet
         ctx.fillStyle = "#f1f5ff";
         ctx.beginPath();
         ctx.arc(400, rocketY, 20, 0, Math.PI * 2);
         ctx.fill();

         // Visor
         ctx.fillStyle = "#153e70";
         ctx.fillRect(388, rocketY - 8, 24, 14);

         // Visor reflection
         ctx.fillStyle = "#42d6ff";
         ctx.fillRect(391, rocketY - 5, 12, 3);
     }

     // Fade text in and out
     const fadeIn = Math.min(1, sceneTime / 0.8);
     const fadeOut = Math.min(1, (sceneDuration - sceneTime) / 0.8);
     ctx.globalAlpha = Math.max(0, Math.min(fadeIn, fadeOut));

     // Scene title
     ctx.textAlign = "center";
     ctx.fillStyle = "#42d6ff";
     ctx.font = "bold 30px Arial";
     ctx.fillText(scene.title, canvas.width / 2, 90);

     // Story text
     ctx.fillStyle = "#ffffff";
     ctx.font = "18px Arial";
     ctx.fillText(scene.story, canvas.width / 2, 385);

     // Skip instructions
     ctx.globalAlpha = 0.7;
     ctx.fillStyle = "#a5eaff";
     ctx.font = "14px Arial";
     ctx.fillText(
         "PRESS S TO SKIP",
         canvas.width / 2,
         430
     );

     ctx.restore();
 }

// Start the game after everything is ready
gameLoop();