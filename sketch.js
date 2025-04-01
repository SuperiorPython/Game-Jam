// Declare variables for game elements and state
let titlebgImg; // Background image for title screen
let gamebgImg; // Background image for game screen
let player; // Player object
let coins = []; // Array to store coin objects
let enemies = []; // Array to store enemy objects
let obstacles = []; // Array to store obstacle objects
let gameState; // String to represent the current game state
let level = 1; // Current level
let numCoins = 5; // Number of coins per level
let numEnemies = 1; // Number of enemies per level
let numObstacles = 4; // Number of obstacles
let score = 0; // Player's score
let borderSize = 10; // Size of the border around the canvas
let gameOverTextSize = 26; // Text size for game over message
let levelScoreTextSize = 18; // Text size for level and score display
let ghostImg; // Image for enemy
let instructionsVisible = false; // Flag to track if instructions are visible

// Preload function to load external assets
function preload() {
  // Load images and sounds
  titlebgImg = loadImage('title_bg.png');
  gamebgImg = loadImage('game_bg.png');
  ghostImg = loadImage('ghost_10.png');
  coinImg = loadImage('coin.png'); // Load coin image
  coinSound = loadSound('coinsound.mp3'); // Load coin sound
  levelUpSound = loadSound('levelup.mp3'); // Load level up sound
  gameOverSound = loadSound('gameover.mp3'); // Load game over sound
}

// Setup function to initialize the canvas and game state
function setup() {
  createCanvas(600, 600); // Create canvas
  gameState = "title"; // Set initial game state to title screen
}

// Draw function to update and render game elements based on game state
function draw() {
  // Draw elements based on current game state
  if (gameState === "title") {
    // Display title screen
    image(titlebgImg, 0, 0, width, height);
    titleScreen();
  } else if (gameState === "instructions") {
    // Display instructions screen if instructions are not visible
    if (!instructionsVisible) {
      instructionsScreen();
    }
  } else if (gameState === "playing") {
    // Display game screen
    image(gamebgImg, 0, 0, width, height);
    drawGame();
  }
}

// Function to handle key press events
function keyPressed() {
  // Key press events based on current game state
  if (gameState === "title" && keyCode === ENTER) {
    // Transition to instructions screen when Enter key is pressed on title screen
    gameState = "instructions";
  } else if (gameState === "instructions" && keyCode === ENTER) {
    // Start the game when Enter key is pressed on instructions screen
    startGame();
  } else if (gameState === "playing") {
    // Handle player movement during gameplay
    if (!player.isGameOver) {
      // Move player based on arrow keys or WASD keys
      if (keyCode === UP_ARROW || key === 'w') {
        player.move(0, -1);
      } else if (keyCode === DOWN_ARROW || key === 's') {
        player.move(0, 1);
      } else if (keyCode === LEFT_ARROW || key === 'a') {
        player.move(-1, 0);
      } else if (keyCode === RIGHT_ARROW || key === 'd') {
        player.move(1, 0);
      }
    } else {
      // Reset the game when Enter key is pressed after game over
      if (keyCode === ENTER) {
        resetGame();
      }
    }
  }
}

// Function to handle key release events (stop player movement)
function keyReleased() {
  // Stop player movement when arrow keys or WASD keys are released
  if (keyCode === UP_ARROW || key === 'w') {
    player.move(0, 0);
  } else if (keyCode === DOWN_ARROW || key === 's') {
    player.move(0, 0);
  } else if (keyCode === LEFT_ARROW || key === 'a') {
    player.move(0, 0);
  } else if (keyCode === RIGHT_ARROW || key === 'd') {
    player.move(0, 0);
  }
}

// Function to display title screen
function titleScreen() {
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(0);
  text("Welcome to Phantom Plunder", width / 2, height / 2 - 50);
  textSize(20);
  text("Press ENTER to begin your quest!", width / 2, height / 2 + 50);
}

// Function to display instructions screen
function instructionsScreen() {
  background(0);
  image(ghostImg, 0, 0, width, height);
  textSize(18);
  fill(255);
  textAlign(CENTER);
  text("You are a pirate who recently died.", width / 2, height / 2 - 50);
  text("The ghost offers you a chance at revival if you can complete", width / 2, height / 2);
  text("ten stages of collecting moving coins while avoiding detection by sound.", width / 2, height / 2 + 50);
  textSize(20);
  text("Press ENTER to begin your quest!", width / 2, height / 2 + 150);
}

// Function to start the game
function startGame() {
  player = new Player();
  generateLevel();
  gameState = "playing";
}

// Function to draw game elements during gameplay
function drawGame() {
  player.update();
  player.display();

  for (let coin of coins) {
    coin.update();
    coin.display();
    if (player.collect(coin)) {
      coins.splice(coins.indexOf(coin), 1);
      score++;
      coinSound.play(); // Play coin grabbing sound
      moveEnemiesTowardsPlayer();
    }
  }

  for (let enemy of enemies) {
    enemy.update(player.x, player.y);
    enemy.display();
    if (player.hits(enemy)) {
      gameOver();
    }
  }

  for (let obstacle of obstacles) {
    obstacle.display();
    if (player.hits(obstacle)) {
      gameOver();
    }
  }

  textSize(levelScoreTextSize);
  fill(128, 0, 128);
  textAlign(LEFT, BOTTOM);
  text("Level: " + level, 20, 30);
  text("Score: " + score, 20, 60);

  if (coins.length === 0) {
    if (level < 10) {
      level++;
      levelUpSound.play(); // Play level up sound
      generateLevel();
    } else {
      victoryScreen(); // Display victory screen if the player beats level ten
    }
  }
}

// Function to handle game over state
function gameOver() {
  player.isGameOver = true;
  gameOverSound.play(); // Play game over sound
  noLoop();
  textSize(gameOverTextSize);
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  text("Game Over. Press ENTER to Retry", width / 2, height / 2);
  textSize(gameOverTextSize - 10); // Decrease text size for additional message
  text("No matter how hard you try to stay silent,", width / 2, height / 2 + 50);
  text("death always comes for you", width / 2, height / 2 + 70);
}

// Function to reset the game
function resetGame() {
  player.reset();
  coins = [];
  enemies = [];
  obstacles = [];
  level = 1;
  score = 0;
  generateLevel();
  loop();
}

// Function to generate a new level
function generateLevel() {
  let topBorder = new Obstacle(width / 2, borderSize / 2, width, borderSize);
  let leftBorder = new Obstacle(borderSize / 2, height / 2, borderSize, height);
  let bottomBorder = new Obstacle(width / 2, height - borderSize / 2, width, borderSize);
  let rightBorder = new Obstacle(width - borderSize / 2, height / 2, borderSize, height);
  obstacles.push(topBorder, leftBorder, bottomBorder, rightBorder);

  for (let i = 0; i < numCoins * level; i++) {
    let coinX, coinY;
    let valid = false;
    do {
      coinX = random(borderSize, width - borderSize);
      coinY = random(borderSize, height - borderSize);
      if (!isOverlappingObstacle(coinX, coinY)) {
        valid = true;
      }
    } while (!valid);
    coins.push(new Coin(coinX, coinY));
  }
  
  for (let i = 0; i < numEnemies * level; i++) {
    let enemyX, enemyY;
    let valid = false;
    do {
      enemyX = random(borderSize, width - borderSize);
      enemyY = random(borderSize, height - borderSize);
      if (!isOverlappingObstacle(enemyX, enemyY)) {
        valid = true;
      }
    } while (!valid);
    enemies.push(new Enemy(enemyX, enemyY));
  }

  for (let i = 0; i < numObstacles; i++) {
    let obstacleX, obstacleY, obstacleWidth, obstacleHeight;
    let valid = false;
    do {
      obstacleX = random(borderSize, width - borderSize);
      obstacleY = random(borderSize, height - borderSize);
      obstacleWidth = random(20, 100);
      obstacleHeight = random(20, 100);
      if (!isOverlappingObstacle(obstacleX, obstacleY, obstacleWidth, obstacleHeight) &&
          obstacleX > 100 && obstacleY < height - 50) {
        valid = true;
      }
    } while (!valid);
    obstacles.push(new Obstacle(obstacleX, obstacleY, obstacleWidth, obstacleHeight));
  }
}

// Function to move enemies towards the player
function moveEnemiesTowardsPlayer() {
  for (let enemy of enemies) {
    enemy.shouldMoveTowardsPlayer = true;
  }
}

// Function to check if an object is overlapping with any obstacles
function isOverlappingObstacle(x, y, w, h) {
  for (let obstacle of obstacles) {
    if (obstacle.hits(x, y, w, h)) {
      return true;
    }
  }
  return false;
}

// Class for the player object
class Player {
  constructor() {
    this.size = 40; // Size of the pirate image
    this.collisionSize = 10; // Size of the collision box
    this.x = width / 2;
    this.y = height / 2;
    this.speedX = 0;
    this.speedY = 0;
    this.speed = 5;
    this.isGameOver = false;
    this.pirateImage = loadImage('pirate.png'); // Load pirate image
  }
  
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Constrain player within canvas bounds
    this.x = constrain(this.x, borderSize + this.size / 2, width - borderSize - this.size / 2);
    this.y = constrain(this.y, borderSize + this.size / 2, height - borderSize - this.size / 2);
  }
  
  display() {
    image(this.pirateImage, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
  
  move(x, y) {
    if (!this.isGameOver) {
      this.speedX = x * this.speed;
      this.speedY = y * this.speed;
    }
  }
  
  collect(coin) {
    let d = dist(this.x, this.y, coin.x, coin.y);
    if (d < this.size / 2 + coin.size / 2) {
      return true;
    }
    return false;
  }
  
  hits(object) {
    // Check collision with obstacles and enemies
    for (let obstacle of obstacles) {
      if (obstacle.hits(this.x, this.y, this.collisionSize, this.collisionSize)) {
        return true;
      }
    }
    for (let enemy of enemies) {
      let d = dist(this.x, this.y, enemy.x, enemy.y);
      if (d < this.size / 2 + enemy.size / 2) {
        return true;
      }
    }
    return false;
  }
  
  reset() {
    let validPosition = false;
    while (!validPosition) {
      let newX = random(borderSize + 50, width - borderSize - 50);
      let newY = random(borderSize + 50, height - borderSize - 50);
      let overlapping = obstacles.some(obstacle => dist(newX, newY, obstacle.x, obstacle.y) < obstacle.size / 2 + this.collisionSize / 2);
      let enemyOverlap = enemies.some(enemy => dist(newX, newY, enemy.x, enemy.y) < enemy.size / 2 + this.collisionSize / 2);
      if (!overlapping && !enemyOverlap) {
        this.x = newX;
        this.y = newY;
        validPosition = true;
      }
    }
    this.isGameOver = false;
  }
}

// Class for the coin object
class Coin {
  constructor(x, y) {
    this.size = 20; // Size of the coin image
    this.x = x;
    this.y = y;
    this.speedX = random(-2, 2); // Random horizontal speed
    this.speedY = random(-2, 2); // Random vertical speed
    this.coinImage = loadImage('coin.png'); // Load coin image
  }
  
  update() {
    // Move the coin
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Bounce off walls
    if (this.x < borderSize || this.x > width - borderSize) {
      this.speedX *= -1;
    }
    if (this.y < borderSize || this.y > height - borderSize) {
      this.speedY *= -1;
    }
  }
  
  display() {
    image(this.coinImage, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size); // Draw the coin image
  }
}

// Class for the enemy object
class Enemy {
  constructor(x, y) {
    this.size = 40; // Size of the ghost image
    this.hitboxSize = 10; // Size of the hitbox
    this.x = x;
    this.y = y;
    this.speed = 2;
    this.shouldMoveTowardsPlayer = false;
    this.ghostImage = ghostImg; // Load ghost image
  }
  
  update(playerX, playerY) {
    if (this.shouldMoveTowardsPlayer) {
      // Move towards player
      let angle = atan2(playerY - this.y, playerX - this.x);
      this.x += cos(angle) * this.speed;
      this.y += sin(angle) * this.speed;
    }
  }
  
  display() {
    image(this.ghostImage, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}

// Class for the obstacle object
class Obstacle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }
  
  display() {
    noStroke();
    if (this.width === width || this.height === height) {
      fill(128, 0, 128);
    } else {
      fill(0);
    }
    rectMode(CENTER);
    rect(this.x, this.y, this.width, this.height);
  }
  
  hits(px, py, pw, ph) {
    return px > this.x - this.width / 2 - pw / 2 &&
           px < this.x + this.width / 2 + pw / 2 &&
           py > this.y - this.height / 2 - ph / 2 &&
           py < this.y + this.height / 2 + ph / 2;
  }
}
