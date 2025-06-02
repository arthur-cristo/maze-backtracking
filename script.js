class MazeGenerator {
  constructor(size = 15) {
    this.size = size % 2 === 0 ? size + 1 : size;
    this.maze = [];
    this.initialize();
  }

  initialize() {
    this.maze = Array(this.size)
      .fill()
      .map(() => Array(this.size).fill(0));
    for (let i = 0; i < this.size; i++) {
      this.maze[0][i] = this.maze[this.size - 1][i] = 1;
      this.maze[i][0] = this.maze[i][this.size - 1] = 1;
    }
    this.generateWalls();
    this.maze[1][1] = 0;
    this.maze[this.size - 2][this.size - 2] = 0;
  }

  generateWalls() {
    for (let i = 2; i < this.size - 2; i += 2) {
      for (let j = 2; j < this.size - 2; j += 2) {
        this.maze[i][j] = 1;
        const directions = [
          { dx: 1, dy: 0 },
          { dx: -1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 0, dy: -1 },
        ].sort(() => Math.random() - 0.5);
        for (const dir of directions) {
          const nx = i + dir.dx;
          const ny = j + dir.dy;
          if (this.maze[nx][ny] === 0) {
            this.maze[nx][ny] = 1;
            break;
          }
        }
      }
    }
  }

  getMaze() {
    return this.maze;
  }

  getSize() {
    return this.size;
  }
}

class MazeGame {
  constructor() {
    this.elements = {
      maze: document.getElementById("maze"),
      solveMaze: document.getElementById("solveMaze"),
      stopMaze: document.getElementById("stopMaze"),
      resetMaze: document.getElementById("resetMaze"),
      backButton: document.getElementById("backButton"),
      steps: document.getElementById("steps"),
      backtracks: document.getElementById("backtracks"),
      mazeSize: document.getElementById("mazeSize"),
      mazeSizeValue: document.getElementById("mazeSizeValue"),
      speedControl: document.getElementById("speedControl"),
      speedValue: document.getElementById("speedValue"),
    };
    this.size = parseInt(this.elements.mazeSize.value);
    this.speed = parseInt(this.elements.speedControl.value);
    this.generator = new MazeGenerator(this.size);
    this.maze = this.generator.getMaze();
    this.currentPosition = { x: 1, y: 1 };
    this.endPosition = { x: this.size - 2, y: this.size - 2 };
    this.visited = [];
    this.path = [];
    this.solving = false;
    this.shouldStop = false;
    this.steps = 0;
    this.backtracks = 0;
    this.renderMaze();
    this.setupListeners();
    this.updateCounters();
  }

  setupListeners() {
    this.elements.solveMaze.onclick = () => this.solveMaze();
    this.elements.stopMaze.onclick = () => this.stop();
    this.elements.resetMaze.onclick = () => this.reset();
    this.elements.backButton.onclick = () => window.location.reload();
    this.elements.mazeSize.oninput = (e) => {
      const val = parseInt(e.target.value);
      this.size = val;
      this.elements.mazeSizeValue.textContent = `${val}x${val}`;
      this.reset();
    };
    this.elements.speedControl.oninput = (e) => {
      const val = parseInt(e.target.value);
      this.speed = val;
      let speedText = "Normal";
      if (val < 25) speedText = "Muito Lento";
      else if (val < 50) speedText = "Lento";
      else if (val < 75) speedText = "Normal";
      else if (val < 100) speedText = "Rápido";
      else speedText = "Muito Rápido";
      this.elements.speedValue.textContent = speedText;
    };
  }

  updateCounters() {
    this.elements.steps.textContent = this.steps;
    this.elements.backtracks.textContent = this.backtracks;
  }

  renderMaze() {
    this.elements.maze.innerHTML = "";
    let availableWidth = window.innerWidth;
    let availableHeight = window.innerHeight;
    const aside = document.querySelector('aside');
    const isMobile = window.innerWidth <= 900;
    if (!isMobile && aside) {
      availableWidth -= aside.offsetWidth + 40;
      availableHeight -= 40;
    } else if (isMobile) {
      availableWidth -= 10;
      availableHeight -= (aside ? aside.offsetHeight : 0) + 30;
    }
    const available = Math.max(100, Math.min(availableWidth, availableHeight));
    const cellSize = Math.floor(available / this.size);
    const mazePx = cellSize * this.size;
    this.elements.maze.style.width = `${mazePx}px`;
    this.elements.maze.style.height = `${mazePx}px`;
    this.elements.maze.style.gridTemplateColumns = `repeat(${this.size}, ${cellSize}px)`;
    this.elements.maze.style.gridTemplateRows = `repeat(${this.size}, ${cellSize}px)`;
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        if (this.maze[i][j] === 1) cell.classList.add("wall");
        if (i === 1 && j === 1) cell.classList.add("start");
        if (i === this.endPosition.x && j === this.endPosition.y) cell.classList.add("end");
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        this.elements.maze.appendChild(cell);
      }
    }
  }

  async solveMaze() {
    if (this.solving) return;
    this.solving = true;
    this.shouldStop = false;
    this.steps = 0;
    this.backtracks = 0;
    this.updateCounters();
    this.visited = [];
    this.path = [];
    await this.backtrack(this.currentPosition.x, this.currentPosition.y);
    this.solving = false;
  }

  stop() {
    this.shouldStop = true;
  }

  reset() {
    this.generator = new MazeGenerator(this.size);
    this.maze = this.generator.getMaze();
    this.currentPosition = { x: 1, y: 1 };
    this.endPosition = { x: this.size - 2, y: this.size - 2 };
    this.visited = [];
    this.path = [];
    this.steps = 0;
    this.backtracks = 0;
    this.updateCounters();
    this.renderMaze();
  }

  async backtrack(x, y) {
    if (this.shouldStop) return false;
    if (x === this.endPosition.x && y === this.endPosition.y) {
      this.path.push({ x, y });
      this.markCell(x, y, "path");
      return true;
    }
    if (this.maze[x][y] !== 0 || this.visited.some((p) => p.x === x && p.y === y)) {
      return false;
    }
    this.visited.push({ x, y });
    this.steps++;
    this.updateCounters();
    this.markCell(x, y, "current");
    await this.sleep(this.getSpeedDelay(40));
    const directions = [
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: -1 },
    ];
    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      if (await this.backtrack(nx, ny)) {
        this.path.push({ x, y });
        this.markCell(x, y, "path");
        return true;
      }
    }
    this.backtracks++;
    this.updateCounters();
    this.markCell(x, y, "visited");
    await this.sleep(this.getSpeedDelay(20));
    return false;
  }

  markCell(x, y, type) {
    const index = x * this.size + y;
    const cell = this.elements.maze.children[index];
    if (!cell) return;
    cell.classList.remove("current", "visited", "path");
    if (type) cell.classList.add(type);
    if (x === 1 && y === 1) cell.classList.add("start");
    if (x === this.endPosition.x && y === this.endPosition.y) cell.classList.add("end");
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getSpeedDelay(baseDelay) {
    // Converte o valor do slider (1-100) para um multiplicador de velocidade
    // 1 = mais lento (4x mais lento)
    // 50 = velocidade normal (1x)
    // 100 = mais rápido (4x mais rápido)
    const speedMultiplier = 4 - (this.speed / 25);
    return Math.max(1, Math.floor(baseDelay * speedMultiplier));
  }
}

window.addEventListener('resize', () => {
  if (window._mazeGameInstance && typeof window._mazeGameInstance.renderMaze === 'function') {
    window._mazeGameInstance.renderMaze();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  window._mazeGameInstance = new MazeGame();
});
