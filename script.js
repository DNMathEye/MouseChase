// Hello, welcome to the code, with bonus dev commentary :P
// I have used code from some of the resources I have listed, never just Ctrl-C'd but typed out
// but I have made sure to understand all the code I have used
// To demonstrate that, I have added comments explaining parts of the code

// looking up the dino game, I found a couple of ways to implement the game
// one using only css, and one fully fledged in js. I wanted to do the latter
// however, the chasing cat in css only, with keyframes
// mouse animated running, with jump and skid images separate

// sprite sheet is 6816 x 376 made up of 16 426 x 376 frames

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// variables. note the use of let vs var - in this case it doesn't affect much. These are not initialised
// there seems to be some consensus over preferencing let over var since its introduction - will read up more
let score;
let wscore;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};
let touchleft = false;
let touchright = false;
let frameX = 0;
let frameY = 0;
let gameFrame = 0;
const staggerFrames = 1.8;
const playerImage = new Image();
playerImage.src = 'largespritesheet2.png';
const spriteWidth = 426
const spriteHeight = 376

//moved from above the update function (it doesn't matter, except for tidying the code)
let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;


//event listeners: keydown indicates a key pressed down, keyup indicates a key released
// each key is set to true during pressed, and set to false when released
document.addEventListener('keydown', function (evt) {
  keys[evt.code] = true;
});
document.addEventListener('keyup', function (evt) {
  keys[evt.code] = false;
});
document.addEventListener('touchstart', function (evt) {
  evt.preventDefault();
  let touch = evt.touches[0];
  if (2 * touch.pageX > document.body.clientWidth) {
    touchright = true;
  }
  else {
    touchleft = true;
  }
});
document.addEventListener('touchend', function (evt) {
  touchleft = false;
  touchright = false;
});

  
//
class Player {
    //we construct and initialise the Player object
    constructor (x, y, w, h, c) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.c = c;
  
      this.dy = 0;
      this.jumpForce = 14;
      this.originalHeight = h;
      this.grounded = false;
      this.jumpTimer = 0;
    }
  
    Animate () {
      // Jump - if one of the jump keys is pressed, activate jump()
      if (keys['Space'] || keys['KeyW'] || touchright == true) {
        this.Jump();
      } else {
        this.jumpTimer = 0;
      }
  
      //originally this also changed the drawn box that represented the player. I keep it as a hit box
      if (keys['ShiftLeft'] || keys['KeyS'] || touchleft == true) {
        this.h = this.originalHeight / 2;
      } else {
        this.h = this.originalHeight;
      }
  
      this.y += this.dy;
  
      // Gravity#
      // if the bottom of redbox is not on the bottom of the window/canvas, add gravity to its dy
      // and set grounded to false, as the box is in the air
      // this is kind of an interesting function as it isn't just about jumping, it sets a gravity condition in general
      // this can be seen when pressing "down" as the box fall after shrinking
      if (this.y + this.h < canvas.height) {
        this.dy += gravity;
        this.grounded = false;
        frameY=1;
      } 
      // if the redbox is on the bottom of canvas, grounded set true
      // I suspect the setting of this.y is to ensure the box doesn't fall below the bottom
      // yep I just tested, and it can fall through. I kind of want to think about why more later
      else {
        this.dy = 0;
        this.grounded = true;
        this.y = canvas.height - this.h;
        frameY=0;
      }
  
      this.Draw();
    }
  
    Jump () {
      // if the player is on the ground and not jumping and a jump key is pressed, initiate a jump
      // note that the grounded state is immediately changed
      // the change in vertical position starts at negative jumpforce
      if (this.grounded && this.jumpTimer == 0) {
        this.jumpTimer = 1;
        this.dy = -this.jumpForce;
      }
      // if the player has initiated jumping, add to the jumpforce for the keypress duration up to 15
      else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
        this.jumpTimer++;
        this.dy = -this.jumpForce - (this.jumpTimer / 50);
      }
    }
  
    // in the original template code, the player is simply a drawn box
    // in order to update that with a sprite and animation, it needs to call drawImage
    // for now I have entered the pixel values in manually, but this can be factored out
    Draw () {
        // OLD CODE FOR RED SQUARE PLAYER (now hitbox)
        // ctx.beginPath();
        // ctx.fillStyle = this.c;
        // ctx.fillRect(this.x, this.y, this.w, this.h);
        // ctx.closePath();
        // END OF OLD CODE

        // here I started with manually drawing the running frames
        // framerate etc. hasn't been established, so this just increments the frame with every run of draw (ie. update)
        // interestingly, the original code doesn't need to refer to frames at all
        let framePosition = Math.floor(gameFrame/staggerFrames)%16
        frameX = spriteWidth * framePosition
        if (keys['ShiftLeft'] || keys['KeyS'] || touchleft == true) {
            frameY =2;
          } else {
          }
        ctx.drawImage(playerImage, frameX, frameY * spriteHeight, spriteWidth, spriteHeight, player.x -25, player.y, 100, 100)
        
        // following the tutorial, I replaced the below with the above
        // if (gameFrame % staggerFrames == 0){
        //     if (frameX<15) frameX++;
        //     else frameX = 0;
        // }
        gameFrame++

    }
}


class Obstacle {
  constructor (x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;

    this.dx = -gameSpeed;
  }

  Update () {
    this.x += this.dx;
    this.Draw();
    this.dx = -gameSpeed;
  }

  Draw () {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.closePath();
  }
}

class Text {
    // in order these parameters are: text, xpos, ypos, alignment, colour, and size
    // I prefer not use single letter parameters like this, I don't like it stylistically, but I'll leave it for now
  constructor (t, x, y, a, c, s) {
    this.t = t;
    this.x = x;
    this.y = y;
    this.a = a;
    this.c = c;
    this.s = s;
  }

  Draw () {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.font = "bold " + this.s + "px serif";
    ctx.textAlign = this.a;
    ctx.fillText(this.t, this.x, this.y);
    ctx.closePath();
  }
}

// Game Functions
function SpawnObstacle () {
  let size = RandomIntInRange(70, 120);
  let type = RandomIntInRange(0, 1);
  let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, '#BF40BF');

  if (type == 1) {
    obstacle.y -= player.originalHeight - 10;
  }
  obstacles.push(obstacle);
}


function RandomIntInRange (min, max) {
  return Math.round(Math.random() * (max - min) + min);
}


// the game loop starts here, once the site is opened
function Start () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.font = "20px sans-serif";

  gameSpeed = 3;
  gravity = 1;

  score = 0;
  highscore = 0;
  if (localStorage.getItem('highscore')) {
    highscore = localStorage.getItem('highscore');
  }

  // the player object is created
  player = new Player(245, 0, 50, 100, '#FF5858');

  scoreText = new Text("Score: " + score, 25, 50, "left", "#212121", "20");
  highscoreText = new Text("Highscore: " + highscore, 25, 25, "left", "#212121", "20");

  //given what I learned below about the below becoming a loop, I believe it may as well be "Update()"
  // yes upon testing it seems to work just the same
  requestAnimationFrame(Update);
  //Update();
}


// the main game loop. This function progresses the game through frames and clears and rewrites the canvas
//  I want to spend more time to understnad requestAnimationFrame(Update) and callback functions
// OK so as I understand, running reqanimframe on update runs update, which contains itself, so it runs over and over
function Update () {
  requestAnimationFrame(Update);

  //clear the canvas to redraw
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // continues the spawn logic for obstacles, parametrised by gameSpeed
  spawnTimer--;
  if (spawnTimer <= 0) {
    SpawnObstacle();
    console.log(obstacles);
    spawnTimer = initialSpawnTimer - gameSpeed * 8;
    
    if (spawnTimer < 60) {
      spawnTimer = 60;
    }
  }

  // Spawn Enemies
  for (let i = 0; i < obstacles.length; i++) {
    let o = obstacles[i];

    if (o.x + o.w < 0) {
      obstacles.splice(i, 1);
    }

    // Game over condition if the player (previously a box) collides with an obstacle
    // I am keeping the original box player, though not drawn, as a "hitbox"
    // if the player satisfies the game over condition, score, 
    if (
      player.x < o.x + o.w &&
      player.x + player.w > o.x &&
      player.y < o.y + o.h &&
      player.y + player.h > o.y
    ) {
      obstacles = [];
      score = 0;
      spawnTimer = initialSpawnTimer;
      gameSpeed = 3;
      window.localStorage.setItem('highscore', highscore);
    }

    o.Update();
  }

  player.Animate();

  score++;
  wscore = Math.floor(score/10)
  scoreText.t = "Score: " + wscore;
  scoreText.Draw();

  if (wscore > highscore) {
    highscore = wscore;
    highscoreText.t = "Highscore: " + highscore;
  }
  
  highscoreText.Draw();

  // gamespeed is incremented by this value per tick (per run of the Update() function)
  // ie. the obstacles will get faster and faster
  gameSpeed += 0.003;
}

Start();