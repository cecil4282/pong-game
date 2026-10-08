const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('playerScore');
const cpuScoreEl = document.getElementById('cpuScore');

const game = {
  width: canvas.width,
  height: canvas.height,
  paddleWidth: 14,
  paddleHeight: 90,
  paddleSpeed: 7,
  cpuSpeed: 5,
  ballRadius: 10,
  leftScore: 0,
  rightScore: 0,
  leftY: 0,
  rightY: 0,
  mouseY: 0,
  mouseActive: false,
  keys: {
    ArrowUp: false,
    ArrowDown: false,
  },
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  vx: 5,
  vy: 3,
};

const leftPaddle = {
  x: 24,
  y: 0,
  width: game.paddleWidth,
  height: game.paddleHeight,
};

const rightPaddle = {
  x: canvas.width - 24 - game.paddleWidth,
  y: 0,
  width: game.paddleWidth,
  height: game.paddleHeight,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function resetPaddlePositions() {
  leftPaddle.y = game.height / 2 - leftPaddle.height / 2;
  rightPaddle.y = game.height / 2 - rightPaddle.height / 2;
  game.leftY = leftPaddle.y;
  game.rightY = rightPaddle.y;
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  const direction = Math.random() < 0.5 ? -1 : 1;
  ball.vx = direction * (5 + Math.random() * 1.2);
  ball.vy = (Math.random() * 4 - 2);
}

function updateScoreboard() {
  playerScoreEl.textContent = String(game.leftScore);
  cpuScoreEl.textContent = String(game.rightScore);
}

function updatePlayerPaddle() {
  if (game.keys.ArrowUp) {
    leftPaddle.y -= game.paddleSpeed;
    game.mouseActive = false;
  }

  if (game.keys.ArrowDown) {
    leftPaddle.y += game.paddleSpeed;
    game.mouseActive = false;
  }

  if (game.mouseActive) {
    leftPaddle.y = clamp(game.mouseY - leftPaddle.height / 2, 0, game.height - leftPaddle.height);
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, game.height - leftPaddle.height);
}

function updateCpuPaddle() {
  const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
  const ballCenter = ball.y;

  if (ballCenter > paddleCenter) {
    rightPaddle.y += game.cpuSpeed;
  } else if (ballCenter < paddleCenter) {
    rightPaddle.y -= game.cpuSpeed;
  }

  rightPaddle.y = clamp(rightPaddle.y, 0, game.height - rightPaddle.height);
}

function handleWallCollision() {
  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= game.height) {
    ball.vy *= -1;
    ball.y = clamp(ball.y, ball.radius, game.height - ball.radius);
  }
}

function ballHitsPaddle(paddle) {
  return (
    ball.x - ball.radius <= paddle.x + paddle.width &&
    ball.x + ball.radius >= paddle.x &&
    ball.y >= paddle.y &&
    ball.y <= paddle.y + paddle.height
  );
}

function handlePaddleCollision() {
  if (ball.vx < 0 && ballHitsPaddle(leftPaddle)) {
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    const relativeIntersect = (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
    const bounceAngle = relativeIntersect * (Math.PI / 3);
    const speed = Math.hypot(ball.vx, ball.vy) * 1.05;

    ball.vx = Math.cos(bounceAngle) * speed;
    ball.vy = Math.sin(bounceAngle) * speed;
  }

  if (ball.vx > 0 && ballHitsPaddle(rightPaddle)) {
    ball.x = rightPaddle.x - ball.radius;
    const relativeIntersect = (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
    const bounceAngle = relativeIntersect * (Math.PI / 3);
    const speed = Math.hypot(ball.vx, ball.vy) * 1.05;

    ball.vx = -Math.cos(bounceAngle) * speed;
    ball.vy = Math.sin(bounceAngle) * speed;
  }
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  handleWallCollision();
  handlePaddleCollision();

  if (ball.x - ball.radius <= 0) {
    game.rightScore += 1;
    updateScoreboard();
    resetBall();
  }

  if (ball.x + ball.radius >= game.width) {
    game.leftScore += 1;
    updateScoreboard();
    resetBall();
  }
}

function drawCenterLine() {
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(game.width / 2, 0);
  ctx.lineTo(game.width / 2, game.height);
  ctx.strokeStyle = '#dbeafe';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(paddle) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fbbf24';
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCenterLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall();
}

function update() {
  updatePlayerPaddle();
  updateCpuPaddle();
  updateBall();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
  }

  if (event.key in game.keys) {
    game.keys[event.key] = true;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key in game.keys) {
    game.keys[event.key] = false;
  }
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const relativeY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  game.mouseY = relativeY;
  game.mouseActive = true;
});

resetPaddlePositions();
resetBall();
updateScoreboard();
gameLoop();
