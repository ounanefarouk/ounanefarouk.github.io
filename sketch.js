let xFood, yFood;
let score = 0;
let snake;
let gameOver = false;
let canvasContext;

function setup() {
  const cnv = createCanvas(35*16, 35*16);
  cnv.parent('sketch');

  canvasContext = canvas.getContext('2d');
  colorMode(HSB, 360, 100, 100, 100);
  textSize(40);

  // Set shadow effects
  canvasContext.shadowOffsetX = 10;
  canvasContext.shadowOffsetY = 10;
  canvasContext.shadowColor = 'black';
  canvasContext.shadowBlur = 25;

  initializeGame();
  noStroke();
}

function initializeGame() {
  score = 0;
  gameOver = false;
  snake = new Snake();
  snake.update(floor(random(1, 15)), floor(random(1, 15))); // Start away from edges
  generateFood();
}

function draw() {
  background(255);

  if (!gameOver) {
    runGame();
  } else {
    showGameOver();
  }
}

function runGame() {
  // Check if snake ate food
  if (snake.mx === xFood && snake.my === yFood) {
    snake.grow();
    while (snake.isOnFood(xFood, yFood)) {
      generateFood();
    }
    score++;
  }

  // Draw food
  fill(25, 100, 50);
  rect(xFood * 35, yFood * 35, 35, 35);

  // Draw snake and score
  snake.draw();
  fill(255, 0, 0);
  text("Score: " + score, 0, 40);

  // AI movement
  if (AI(snake, 9) === 1000) {
    gameOver = true;
  }
}

function showGameOver() {
  fill(255, 0, 0);
  textSize(60);
  text("GAME OVER", width/2 - 150, height/2 - 30);
  textSize(40);
  text("Final Score: " + score, width/2 - 120, height/2 + 30);
  text("Click to restart", width/2 - 120, height/2 + 80);
}

function mousePressed() {
  if (gameOver) {
    initializeGame();
  }
}

function AI(snake, maxDepth) {
  let bestDirection = 5;
  let minDistance = 1000;

  for (let direction = 1; direction <= 4; direction++) {
    let virtualSnake = new Snake();
    virtualSnake.clone(snake);

    if (virtualSnake.move(direction) && !virtualSnake.intersectsSelf()) {
      let newDistance = abs(virtualSnake.mx - xFood) + abs(virtualSnake.my - yFood);
      if (maxDepth > 0 && newDistance > 0) {
        newDistance += AI(virtualSnake, maxDepth - 1);
      }
      if (newDistance <= minDistance) {
        bestDirection = direction;
        minDistance = newDistance;
      }
    }
  }

  if (!snake.move(bestDirection)) {
    return 1000;
  }
  return minDistance;
}

function generateFood() {
  do {
    xFood = floor(random(0, 16));
    yFood = floor(random(0, 16));
  } while (snake.isOnFood(xFood, yFood));
}

class Snake {
  constructor() {
    this.mx = 0; // x position
    this.my = 0; // y position
    this.forbiddenDirection = 0; // direction that would make snake reverse
    this.nextSegment = null; // next segment in the snake
  }

  clone(otherSnake) {
    this.update(otherSnake.mx, otherSnake.my);
    this.forbiddenDirection = otherSnake.forbiddenDirection;
    if (otherSnake.nextSegment !== null) {
      this.nextSegment = new Snake();
      this.nextSegment.clone(otherSnake.nextSegment);
    }
  }

  update(newX, newY) {
    if (this.nextSegment !== null) {
      this.nextSegment.update(this.mx, this.my);
    }
    this.mx = newX;
    this.my = newY;
  }

  draw() {
    fill(0);
    rect(this.mx * 35 + 2, this.my * 35 + 2, 35 - 2, 35 - 2);

    if (this.nextSegment !== null) {
      this.nextSegment.draw();
    }
  }

  grow() {
    if (this.nextSegment === null) {
      this.nextSegment = new Snake();
      this.nextSegment.update(this.mx, this.my);
    } else {
      this.nextSegment.grow();
    }
  }

  move(direction) {
    if (this.forbiddenDirection === direction) return false;

    let newX = this.mx;
    let newY = this.my;

    switch(direction) {
      case 1: newX++; break; // Right
      case 2: newX--; break; // Left
      case 3: newY++; break; // Down
      case 4: newY--; break; // Up
    }

    // Check boundaries
    if (newX < 0 || newX >= 16 || newY < 0 || newY >= 16) {
      return false;
    }

    this.update(newX, newY);

    // Set forbidden direction (opposite of current movement)
    this.forbiddenDirection = [0, 2, 1, 4, 3][direction];
    return true;
  }

  intersectsSelf() {
    let segment = this.nextSegment;
    while (segment !== null) {
      if (segment.mx === this.mx && segment.my === this.my) {
        return true;
      }
      segment = segment.nextSegment;
    }
    return false;
  }

  isOnFood(x, y) {
    if (this.mx === x && this.my === y) return true;
    if (this.nextSegment !== null) {
      return this.nextSegment.isOnFood(x, y);
    }
    return false;
  }
}

function keyPressed() {
  if (key === 's') {
    saveGif('mySketch', 5);
  }
}
