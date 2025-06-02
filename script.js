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
      steps: document.getElementById("steps"),
      backtracks: document.getElementById("backtracks"),
      mazeSize: document.getElementById("mazeSize"),
      mazeSizeValue: document.getElementById("mazeSizeValue"),
      speedControl: document.getElementById("speedControl"),
      speedValue: document.getElementById("speedValue"),
    };

    // Validação dos elementos necessários
    if (!this.validateElements()) {
      console.error("Elementos necessários não encontrados!");
      return;
    }

    this.size = this.validateSize(parseInt(this.elements.mazeSize.value));
    this.speed = this.validateSpeed(parseInt(this.elements.speedControl.value));
    this.generator = new MazeGenerator(this.size);
    this.maze = this.generator.getMaze();
    this.currentPosition = { x: 1, y: 1 };
    this.endPosition = { x: this.size - 2, y: this.size - 2 };
    this.visited = [];
    this.path = [];
    this.solving = false;
    this.shouldStop = false;
    this.isPaused = false;
    this.steps = 0;
    this.backtracks = 0;
    this.renderMaze();
    this.setupListeners();
    this.updateCounters();
  }

  validateElements() {
    return Object.values(this.elements).every(element => element !== null);
  }

  validateSize(size) {
    const minSize = 7;
    const maxSize = 41;
    return Math.min(Math.max(size, minSize), maxSize);
  }

  validateSpeed(speed) {
    const minSpeed = 1;
    const maxSpeed = 100;
    return Math.min(Math.max(speed, minSpeed), maxSpeed);
  }

  setupListeners() {
    if (!this.elements.solveMaze || !this.elements.stopMaze || 
        !this.elements.resetMaze || !this.elements.mazeSize || 
        !this.elements.speedControl) {
      return;
    }

    this.elements.solveMaze.onclick = () => {
      if (!this.solving) {
        this.solveMaze();
      }
    };

    this.elements.stopMaze.onclick = () => {
      if (this.solving) {
        if (this.isPaused) {
          this.resume();
        } else {
          this.pause();
        }
      }
    };

    this.elements.resetMaze.onclick = () => this.reset();

    this.elements.mazeSize.oninput = (e) => {
      const val = this.validateSize(parseInt(e.target.value));
      this.size = val;
      this.elements.mazeSizeValue.textContent = `${val}x${val}`;
      this.reset();
    };

    this.elements.speedControl.oninput = (e) => {
      const val = this.validateSpeed(parseInt(e.target.value));
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
    
    try {
      this.solving = true;
      this.shouldStop = false;
      this.isPaused = false;
      this.steps = 0;
      this.backtracks = 0;
      this.updateCounters();
      this.visited = [];
      this.path = [];
      
      // Desabilita os controles durante a resolução
      this.toggleControls(true);
      this.updateShuffleButton();
      
      await this.backtrack(this.currentPosition.x, this.currentPosition.y);
    } catch (error) {
      console.error("Erro ao resolver o labirinto:", error);
    } finally {
      this.solving = false;
      this.isPaused = false;
      this.toggleControls(false);
      this.updateStopButton();
      this.updateShuffleButton();
    }
  }

  toggleControls(disabled) {
    if (this.elements.solveMaze) this.elements.solveMaze.disabled = disabled;
    if (this.elements.mazeSize) this.elements.mazeSize.disabled = disabled;
    if (this.elements.resetMaze) this.elements.resetMaze.disabled = (this.elements.solveMaze ? this.elements.solveMaze.disabled : disabled);
  }

  pause() {
    if (this.solving && !this.isPaused) {
      this.isPaused = true;
      this.updateStopButton();
      this.updateShuffleButton();
    }
  }

  resume() {
    if (this.solving && this.isPaused) {
      this.isPaused = false;
      this.updateStopButton();
      this.updateShuffleButton();
    }
  }

  updateStopButton() {
    if (this.elements.stopMaze) {
      this.elements.stopMaze.textContent = this.isPaused ? "Retomar" : "Parar";
    }
    // Desabilita o botão embaralhar durante toda a execução (resolvendo ou pausado)
    if (this.elements.resetMaze) {
      this.elements.resetMaze.disabled = !!this.solving;
    }
  }

  updateShuffleButton() {
    if (!this.elements.resetMaze) return;
    const atStart = this.currentPosition.x === 1 && this.currentPosition.y === 1;
    const atEnd = this.currentPosition.x === this.endPosition.x && this.currentPosition.y === this.endPosition.y;
    this.elements.resetMaze.disabled = !(atStart || atEnd);
  }

  reset() {
    // Permite resetar a qualquer momento
    try {
      // Para a resolução atual se estiver em andamento
      if (this.solving) {
        this.shouldStop = true;
        this.solving = false;
        this.isPaused = false;
      }

      // Gera um novo labirinto (embaralha)
      this.generator = new MazeGenerator(this.size);
      this.maze = this.generator.getMaze();
      this.currentPosition = { x: 1, y: 1 };
      this.endPosition = { x: this.size - 2, y: this.size - 2 };
      this.path = [];
      this.visited = [];
      this.steps = 0;
      this.backtracks = 0;
      
      // Atualiza a interface
      this.updateCounters();
      this.renderMaze();
      this.updateStopButton();
      this.toggleControls(false);
      this.updateShuffleButton();
    } catch (error) {
      console.error("Erro ao resetar o labirinto:", error);
    }
  }

  async backtrack(x, y) {
    if (this.shouldStop) return false;
    
    // Verifica se está pausado
    if (this.isPaused) {
      await new Promise(resolve => {
        const checkPause = setInterval(() => {
          if (!this.isPaused) {
            clearInterval(checkPause);
            resolve();
          }
        }, 100);
      });
    }

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
    // Atualiza o botão embaralhar sempre que o player se move
    this.currentPosition = { x, y };
    this.updateShuffleButton();
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getSpeedDelay(baseDelay) {
    try {
      const speedMultiplier = 4 - (this.speed / 25);
      return Math.max(1, Math.floor(baseDelay * speedMultiplier));
    } catch (error) {
      console.error("Erro ao calcular o delay:", error);
      return baseDelay;
    }
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
