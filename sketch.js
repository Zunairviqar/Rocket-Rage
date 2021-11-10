// Keeping track of Frames (for excluding those in the pause state)
let frameCount;
// To keep track of the state of the game
let pause;
let gameOver;
let gameStart;

// Variables for rocket position and speed.
let rocketX;
let rocketY;
let rocketSpeedX;
let rocketSpeedY;

// Boundaries of the rocket
let rocketTop;
let rocketBottom;
let rocketLeft;
let rocketRight;

// Detecting the collision
let collision;
let tankCollision;
// Points system with Fuel and a 'score'
let rocketFuel;
let score;

// Variables for fluctuating the difficulty
let fuelContent;
let accel;
let asteroidRate;
let fuelLeak;
let gasFreq;

// Keeping track of difficulty
let difficulty;

// Keeping track of the rocket angle
let angle = 0

// For scrolling the background
let p1 = 0;
let p2 = -600;

// Position of earth shown at the beginning.
let earthX;
let earthY;

// Two arrays/lists to store the Fuel Tanks/ Asteroids displayed
let asteroids = [];
let fuelTanks = [];

// Keeping track of the highest ever scores in both difficulties
let hardHS = 0;
let easyHS = 0;


function preload() {
  bg = loadImage('assets/space.png');
  rocket = loadImage('assets/rocket.png');
  earth = loadImage('assets/earth.png');
  asteroid_1 = loadImage('assets/asteroid_1.png');
  asteroid_2 = loadImage('assets/asteroid_2.png');
  fireball_1 = loadImage('assets/fireball_1.gif');
  fuel = loadImage('assets/fuel.png');
  collision_music = loadSound("assets/collision.wav");
  fuel_music = loadSound("assets/fuel_collect.wav");
}

function setup() {
  var canvasMain = createCanvas(600, 600);

  // Accessing the local storage to obtain the previous high scores
  let hHS = window.localStorage.getItem('hardHighScore');
  let eHS = window.localStorage.getItem('easyHighScore');

  // if both values exist (i.e. they aren't null) use those high scores.
  if (eHS) {
    easyHS = eHS;
  }
  if (hHS){
    hardHS = hHS;
  }

  // set the ID on the canvas element
  canvasMain.id("p5_mainCanvas");

  // set the parent of the canvas element to the element in the DOM with
  // an ID of "left"
  canvasMain.parent("#center");

  // Starting the game with pause state
  pause = true;
  gameStart = false;

  // Initializing the variables with default settings for 'Easy'
  frameCount = 0;
  rocketX = 300;
  rocketY = 480;
  rocketSpeedX = 0;
  rocketSpeedY = 0;
  accel = 0.1;
  asteroidRate = 35;
  fuelLeak = 40;
  gasFreq = 400;

  earthX = 300;
  earthY = 590;
  rocketFuel = 100;
  tankCollision = false;
  score = 0;
  gameOver = false;
  fuelContent = 14;

  difficulty = "Easy"

}

function draw(){
  background(0);
  // Creating the background and adding the scrolling effect to it.
  image(bg, 0, p1);
  image(bg, 0, p2);

  // Condition to ensure the game isnt paused or over
  if(pause == false && gameOver == false){
    frameCount +=1;
    // Reducing the Y positions of the background to allow for a smoothly moving background
    p1 += 2;
    p2 += 2;
  }

  // When the first background image completely moves away from the screen, it is set to come after the second image.
  if (p1 >= 600) {
    p1 = p2 - 600;
  }
  // When the second background image completely moves away from the screen, it is set to come after the first image.
  if (p2 >= 600) {
    p2 = p1 - 600;
  }

  // Displaying the earth and then removing it
  if (frameCount >= 60){
    if(pause == false){
      earthY += 2;
    }
  }
  if (frameCount >-1 && frameCount <= 120){
    // Making the earth visible
    imageMode(CENTER);
    image(earth,earthX,earthY, 200,200)
    imageMode(CORNER);
  }

  // ROTATING THE ROCKET
  // store the current drawing matrix
  push()
  // move the origin to where the mouse is
  translate(rocketX, rocketY);
  // rotate using our angle variable
  rotate(radians(angle) )
  imageMode(CENTER)
  image(rocket,0, 0, 80, 75.6)
  // restore the previous drawing matrix
  pop()

  if(pause == false && gameOver == false){
    // Moving the Rocket with KEYS
    // Increasing the X speed of the rocket by the acceleration when the 'D' key is pressed
    if (keyIsDown(68)) {
      rocketSpeedX += accel
      // update the angle variable for the next draw cycle
      angle += 1
    }
    // Decreasing the X speed of the rocket by the deceleration when the 'A' key is pressed
    if (keyIsDown(65)) {
      rocketSpeedX -=accel;
      // update the angle variable for the next draw cycle
      angle -= 1
    }

    // Increasing the Y speed of the rocket by the acceleration when the 'W' key is pressed
    if (keyIsDown(83)) {
      rocketSpeedY +=accel;
    }
    // Decreasing the Y speed of the rocket by the deceleration when the 'A' key is pressed
    if (keyIsDown(87)) {
      rocketSpeedY -=accel;
    }

    rocketX += rocketSpeedX
    rocketY += rocketSpeedY
  }

  // Fine tuned boundaries of the rocket
  rocketRight = 0 + rocketX + 10
  rocketLeft = 0 + rocketX - 15
  rocketTop = rocketY - 25
  rocketBottom = rocketY + 35

  // // Wrap around logic
  if (rocketRight > width){
    rocketX = 15;
  }
  if (rocketLeft <= 0){
    rocketX = width-15;
  }

  // Ending the game in the case the rocket goes above or below the frame
  if(rocketTop<15){
    resetVariables();
  }
  if(rocketBottom > height-15){
    resetVariables();
  }

  // Increading the Score
  if (frameCount % 30 == 0){
    if (pause == false && gameOver == false){
        score += 1;
    }
  }

  // Reducing the rocketFuel
  if (frameCount % fuelLeak == 0){
    if (pause == false && gameOver == false){
      // Decreasing the rocketFuel with the interval specific by fuelleak
        rocketFuel -= 1;
    }
  }
  if (rocketFuel <= 0){
    gameOver = true;
  }

  // Displaying the fuel tanks
  if (frameCount > 60){
    if (frameCount % gasFreq == 0){
      if(pause == false && gameOver == false){
        // A new fule tank is created after the interval specific with 'gameOver'
          fuelTanks.push(new FuelTank());
      }
    }
    // Fuel tanks are only displayed when the game isnt paused
    for (let y = 0; y < fuelTanks.length; y ++){
      fuelTanks[y].display();
      if (pause == false && gameOver == false){
        fuelTanks[y].move();
        fuelTanks[y].collision();
      }
    }
  }

  // Displaying the Asteroids
  if (frameCount > 60){
    if (frameCount % asteroidRate == 0){
      if(pause == false && gameOver == false){
          asteroids.push(new Asteroid());
      }
    }

    for(let i = 0; i < asteroids.length; i ++){
      asteroids[i].display();
      if (pause == false && gameOver == false){
        asteroids[i].move();
        asteroids[i].collision();
      }
    }

  }

  // Creating boundaries of the frame
  fill(134,9,9);
  noStroke();
  rect(0,0,600,15);
  rect(0,0,15,600);
  rect(600,0,-15,600);
  rect(0,600,600,-15);

  // Displaying the score
  fill(255);
  text("Fuel: " + rocketFuel + "%", 30,30)
  text("Score: " + score, 520,30)

  // Displaying the start screen when the game is over
  if(gameStart == false){
    fill(255,255,255,90);
    rect(50,50,500,500)
    fill(255);
    push();

    textSize(20);
    textAlign(CENTER, CENTER);
    text("ROCKET RAGE v1.0", 300, 120);
    textSize(15);

    text("Choose your difficulty:", 300, 160);

    fill(134,9,9)
    rect(180,200,80,40)

    rect(350,200,80,40)
    fill(255);

    text("Easy", 220, 220)
    text("Hard", 390, 220)

    text("You have chosen: " + difficulty, 300, 280);

    textSize(18);
    text("Press ENTER to begin the game. ", 300, 330);
    textSize(15);
    text("Your highest score for Easy mode is: " + easyHS, 300, 370);
    text("Your highest score for Hard mode is: " + hardHS, 300, 400);

    text("Try to beat that! ", 300, 430);
    fill(0);
    text("Scroll below for instructions on how to play", 300, 540);
    pop();

  }
}

class Asteroid {

  constructor(){
    // Assigning random position and speed to the asteroid
    this.x = random(60,590);
    this.speed = random(2,5)
    this.size = random(30,90);
    this.y = 5+ this.size/2;
    // Assigning random image to the asteroid
    this.pic = random([asteroid_1, asteroid_2, fireball_1])
    fill(255);
  }

  display(){
    // Displaying the asteroid
    imageMode(CENTER);
    image(this.pic, this.x, this.y, this.size, this.size);
    imageMode(CORNER);

    // Setting the boundaries of each Asteroid

    this.Top = this.y-this.size/2
    this.Bottom = this.y+this.size/2
    this.Right = this.x+this.size/2
    this.Left = this.x-this.size/2+5

    if(this.pic == asteroid_2){
      this.Top = this.y-this.size/3+15
      this.Bottom = this.y+this.size/3
      this.Right = this.x+this.size/3
      this.Left = this.x-this.size/2
    }


    if(this.pic == fireball_1){
      this.Top = this.y-this.size/3+15
      this.Bottom = this.y+this.size/3
      this.Right = this.x+this.size/3-5
      this.Left = this.x-this.size/3+5
    }
  }

  move(){
    // Moving thr asteroid
    this.y += this.speed;
  }

  collision(){
    // Detecting if no collision between rocket and asteroid
    if ((rocketTop > this.Bottom || rocketLeft > this.Right || rocketRight < this.Left || rocketBottom < this.Top)){
      collision = false;
    }
    else{
      // Otherwise ending the game
      resetVariables();
    }
  }

}


class FuelTank{
  constructor(){
    this.x = random(60,500);
    this.speed = random(1,2)
    this.size = random(30,40);
    this.y = 5+ this.size/2;
    this.pic = fuel;
  }

  display(){
    imageMode(CENTER);
    image(this.pic, this.x, this.y, this.size*0.705, this.size);
    imageMode(CORNER);

    // Setting the boundaries of each Asteroid

    this.Top = this.y-this.size/2
    this.Bottom = this.y+this.size/2
    this.Right = this.x+this.size/2
    this.Left = this.x-this.size/2
  }
  move(){
    this.y += this.speed;
  }

  collision(){
    if ((rocketTop > this.Bottom || rocketLeft > this.Right || rocketRight < this.Left || rocketBottom < this.Top)){
      tankCollision = false;
    }
    else{
      tankCollision = true;
      fuel_music.play();
      this.x = -100;
      this.y = -100;
      rocketFuel += fuelContent;
      score +=15;
    }
  }
}

// Function to reset all the variables accordingly as the game ends and change the state of the game
function resetVariables(){
  collision_music.play();

  // Comparing the previous high score and changing the high score stored in the case we have a new high score.
  if( difficulty == 'Hard'){
    if(score > hardHS){
      hardHS = score
      window.localStorage.setItem('hardHighScore', hardHS);
    }
  }
  if( difficulty == 'Easy'){
    if(score > easyHS){
      easyHS = score
      window.localStorage.setItem('easyHighScore', easyHS);
    }
  }
  collision = true;
  gameOver = true;
  gameStart = false;
  fuelTanks = [];
  frameCount = 0;
  asteroids = [];
  rocketX = 300;
  rocketY = 480;
  angle = 0;
  rocketSpeedX = 0;
  rocketSpeedY = 0;
  earthX = 300;
  earthY = 590;
  score = 0;
  rocketFuel = 100;
}
// Detecting if the 'Easy' or 'Hard' buttons are pressed
function mousePressed(){
  if (!(mouseY > 240|| mouseX < 180 || mouseX > 260 || mouseY < 200)){
    chooseEasy();
  }

  if (!(mouseY > 240|| mouseX < 250 || mouseX > 430 || mouseY < 200)){
    chooseHard();
  }
}
// Setting variables for the easy mode
function chooseEasy(){
  difficulty = "Easy";
  accel = 0.1;
  asteroidRate = 35;
  fuelLeak = 40;
  gasFreq = 400;
  fuelContent = 14;
}
// Setting variables for the hard mode
function chooseHard(){
  difficulty = "Hard";
  accel = 0.3;
  asteroidRate = 20;
  fuelLeak = 20;
  gasFreq = 200;
  fuelContent = 20;
}

// Starting the game on pressing 'Enter'
function keyPressed(){
  // Pressing the Enter Key starts the game
  if(keyCode == (RETURN)){
    pause = false;
    gameOver = false;
    gameStart = true;
  }
}

// Pausing the game with the HTML Button
function pauseGame() {
  pause = true;
}
// Resuming the game with the HTML Button
function resumeGame() {
  if (gameStart == true){
      pause = false;
  }
}
