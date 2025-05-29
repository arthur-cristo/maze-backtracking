// Screens
const startScreen = document.getElementById("start-screen");
const mazeScreen = document.getElementById("maze-screen");

// Buttons
const startButton = document.getElementById("start-button");
const menuButton = document.getElementById("menu-button");
const resetButton = document.getElementById("reset-button");

export class Player {
  constructor(grid, cols, rows) {
    this.grid = grid;
    this.cols = cols;
    this.rows = rows;
    this.x = 0; // Posição inicial X
    this.y = 0; // Posição inicial Y
    this.currentCell = null;
    this.visitedCells = new Set();
    this.solutionPath = [];
    this.isSolving = false;
    this.stack = []; // Pilha para rastrear o caminho
    this.tries = 0; // Contador de tentativas
    this.steps = 0; // Contador de passos
    this.returns = 0; // Contador de retornos
    this.shouldStop = false;
    this.initializePlayer();
  }

  initializePlayer() {
    this.currentCell = this.grid[this.y][this.x];
    this.visitedCells.add(`${this.x},${this.y}`);
    this.currentCell.style.backgroundColor = "#4CAF50"; // Cor verde para o player
    this.stack = [[this.x, this.y]];
  }

  async solveMaze() {
    if (this.isSolving) return;
    this.isSolving = true;
    this.shouldStop = false;

    // Reset dos contadores
    this.steps = 0;
    this.returns = 0;
    document.getElementById("steps-value").innerText = this.steps;
    document.getElementById("returns-value").innerText = this.returns;

    // Limpa o estado anterior
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches)
          this.grid[y][x].style.backgroundColor = "#cccccc";
        else
          this.grid[y][x].style.backgroundColor = "#1a1a1a";
      }
    }

    // Mantém a cor da célula final
    const endCell = this.grid[this.rows - 1][this.cols - 1];
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches)
      endCell.style.backgroundColor = "#FFD700";
    else
      endCell.style.backgroundColor = "#FFA500";

    this.visitedCells.clear();
    this.solutionPath = [];
    this.stack = [];
    this.x = 0;
    this.y = 0;
    this.currentCell = this.grid[this.y][this.x];
    this.visitedCells.add(`${this.x},${this.y}`);
    this.stack.push([this.x, this.y]);

    const endX = this.cols - 1;
    const endY = this.rows - 1;

    try {
      const success = await this.backtrack(this.x, this.y, endX, endY);
      if (success && !this.shouldStop) {
        console.log("Labirinto resolvido!");
        await this.showSolution();
      }
    } catch (e) {
      if (e.message === 'STOPPED') {
        console.log("Resolução cancelada!");
        this.resetToStart();
      }
    } finally {
      this.isSolving = false;
    }
  }

  async backtrack(x, y, endX, endY) {
    if (this.shouldStop) {
      throw new Error('STOPPED');
    }

    // Se chegou ao final, retorna sucesso
    if (x === endX && y === endY) {
      this.solutionPath = [...this.stack];
      this.steps++;
      document.getElementById("steps-value").innerText = this.steps;
      return true;
    }

    // Direções possíveis
    const directions = [
      [1, 0], // direita
      [0, 1], // baixo
      [-1, 0], // esquerda
      [0, -1], // cima
    ];

    // Tenta cada direção
    for (const [dx, dy] of directions) {
      if (this.shouldStop) {
        throw new Error('STOPPED');
      }

      const newX = x + dx;
      const newY = y + dy;

      if (
        this.isValidMove(newX, newY) &&
        !this.visitedCells.has(`${newX},${newY}`)
      ) {
        // Marca a célula atual como visitada
        this.visitedCells.add(`${newX},${newY}`);
        this.stack.push([newX, newY]);
        this.tries++;
        this.steps++;
        document.getElementById("steps-value").innerText = this.steps;

        // Move o robô visualmente
        if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: light)").matches
        )
          this.grid[y][x].style.backgroundColor = "#87CEEB";
        else this.grid[y][x].style.backgroundColor = "#376f8a";
        this.x = newX;
        this.y = newY;
        this.currentCell = this.grid[newY][newX];
        this.currentCell.style.backgroundColor = "#4CAF50";

        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
          if (await this.backtrack(newX, newY, endX, endY)) {
            return true;
          }
        } catch (e) {
          if (e.message === 'STOPPED') throw e;
        }

        // Se não deu certo, volta
        this.stack.pop();
        this.steps++;
        this.returns++;
        document.getElementById("steps-value").innerText = this.steps;
        document.getElementById("returns-value").innerText = this.returns;

        if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: light)").matches
        )
          this.currentCell.style.backgroundColor = "#FFA07A";
        else this.currentCell.style.backgroundColor = "#b36b4a";

        // Move o robô de volta
        if (this.stack.length > 0) {
          const [lastX, lastY] = this.stack[this.stack.length - 1];
          this.x = lastX;
          this.y = lastY;
          this.currentCell = this.grid[lastY][lastX];
          this.currentCell.style.backgroundColor = "#4CAF50";
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return false;
  }

  resetToStart() {
    this.x = 0;
    this.y = 0;
    this.currentCell = this.grid[this.y][this.x];
    this.currentCell.style.backgroundColor = "#4CAF50";
  }

  async showSolution() {
    // Limpa as cores do caminho
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        // Não altera a cor da célula final
        if (y === this.rows - 1 && x === this.cols - 1) continue;
        
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches)
          this.grid[y][x].style.backgroundColor = "#cccccc";
        else
          this.grid[y][x].style.backgroundColor = "#1a1a1a";
      }
    }

    // Mostra o caminho da solução
    for (const [x, y] of this.solutionPath) {
      // Não altera a cor da célula final
      if (y === this.rows - 1 && x === this.cols - 1) continue;
      
      this.grid[y][x].style.backgroundColor = "#2196F3";
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  isValidMove(x, y) {
    // Verifica limites do labirinto
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
      return false;
    }

    const currentCell = this.grid[this.y][this.x];
    const nextCell = this.grid[y][x];

    // Verifica a direção do movimento e as paredes correspondentes
    if (x > this.x) {
      // Movendo para direita
      return (
        currentCell.style.borderRight === "none" &&
        nextCell.style.borderLeft === "none"
      );
    } else if (x < this.x) {
      // Movendo para esquerda
      return (
        currentCell.style.borderLeft === "none" &&
        nextCell.style.borderRight === "none"
      );
    } else if (y > this.y) {
      // Movendo para baixo
      return (
        currentCell.style.borderBottom === "none" &&
        nextCell.style.borderTop === "none"
      );
    } else if (y < this.y) {
      // Movendo para cima
      return (
        currentCell.style.borderTop === "none" &&
        nextCell.style.borderBottom === "none"
      );
    }

    return false;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  getVisitedCells() {
    return this.visitedCells;
  }

  stop() {
    this.shouldStop = true;
    this.isSolving = false;
    this.steps = 0;
    this.returns = 0;
    document.getElementById("steps-value").innerText = this.steps;
    document.getElementById("returns-value").innerText = this.returns;
    
    // Limpa as cores do caminho
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches)
          this.grid[y][x].style.backgroundColor = "#cccccc";
        else
          this.grid[y][x].style.backgroundColor = "#1a1a1a";
      }
    }
    
    // Mantém a cor da célula final
    const endCell = this.grid[this.rows - 1][this.cols - 1];
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches)
      endCell.style.backgroundColor = "#FFD700";
    else
      endCell.style.backgroundColor = "#FFA500";
    
    // Retorna o player para a posição inicial
    this.x = 0;
    this.y = 0;
    this.currentCell = this.grid[this.y][this.x];
    this.currentCell.style.backgroundColor = "#4CAF50";
  }
}

let steps = 0;
let player = null;
const stepsElement = document.getElementById("steps-value");

// Direções possíveis para mover (cima, direita, baixo, esquerda)
const directions = [
  [0, -1], // cima
  [1, 0], // direita
  [0, 1], // baixo
  [-1, 0], // esquerda
];

// Função para embaralhar um array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Função para verificar se uma célula está dentro dos limites do labirinto
const isValidCell = (x, y, cols, rows) => {
  return x >= 0 && x < cols && y >= 0 && y < rows;
};

// Função para gerar o labirinto usando backtracking
const generateMazeBacktracking = (grid, cols, rows) => {
  const visited = new Array(rows).fill().map(() => new Array(cols).fill(false));
  const stack = [];

  // Começa em uma posição aleatória
  const startX = Math.floor(Math.random() * cols);
  const startY = Math.floor(Math.random() * rows);

  stack.push([startX, startY]);
  visited[startY][startX] = true;

  while (stack.length > 0) {
    const [x, y] = stack[stack.length - 1];
    const neighbors = [];

    // Encontra vizinhos não visitados
    for (const [dx, dy] of shuffleArray([...directions])) {
      const newX = x + dx;
      const newY = y + dy;

      if (isValidCell(newX, newY, cols, rows) && !visited[newY][newX]) {
        neighbors.push([newX, newY]);
      }
    }

    if (neighbors.length > 0) {
      const [newX, newY] = neighbors[0];
      visited[newY][newX] = true;

      // Remove a parede entre as células
      const cell = grid[y][x];
      const newCell = grid[newY][newX];

      if (newX > x) {
        // direita
        cell.style.borderRight = "none";
        newCell.style.borderLeft = "none";
      } else if (newX < x) {
        // esquerda
        cell.style.borderLeft = "none";
        newCell.style.borderRight = "none";
      } else if (newY > y) {
        // baixo
        cell.style.borderBottom = "none";
        newCell.style.borderTop = "none";
      } else if (newY < y) {
        // cima
        cell.style.borderTop = "none";
        newCell.style.borderBottom = "none";
      }

      stack.push([newX, newY]);
    } else {
      stack.pop();
    }
  }
};

const generateGrid = () => {
  const maze = document.getElementById("maze-container");
  maze.innerHTML = "";

  const mazeWidth = maze.clientWidth;
  const mazeHeight = maze.clientHeight;
  const cellSize = Math.min(mazeWidth, mazeHeight) / 10;
  const cols = Math.floor(mazeWidth / cellSize);
  const rows = Math.floor(mazeHeight / cellSize);
  const cellWidth = Math.floor(mazeWidth / cols);
  const cellHeight = Math.floor(mazeHeight / rows);

  const grid = [];

  for (let row = 0; row < rows; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("maze-row");
    rowDiv.style.display = "flex";

    const rowCells = [];
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("div");
      cell.classList.add("maze-cell");
      cell.style.width = `${cellWidth}px`;
      cell.style.height = `${cellHeight}px`;
      cell.style.boxSizing = "border-box";
      cell.style.border = "1px solid";
      rowDiv.appendChild(cell);
      rowCells.push(cell);
    }
    maze.appendChild(rowDiv);
    grid.push(rowCells);
  }

  generateMazeBacktracking(grid, cols, rows);

  // Define a cor da célula final
  const endCell = grid[rows - 1][cols - 1];
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  )
    endCell.style.backgroundColor = "#FFD700"; // Dourado para tema claro
  else endCell.style.backgroundColor = "#FFA500"; // Laranja para tema escuro

  // Inicializa o player após gerar o labirinto
  player = new Player(grid, cols, rows);

  return { cols, rows };
};

// Adiciona os controles de teclado
document.addEventListener("keydown", (event) => {
  if (!player) return;

  let direction = null;
  switch (event.key) {
    case "ArrowUp":
      direction = "up";
      break;
    case "ArrowRight":
      direction = "right";
      break;
    case "ArrowDown":
      direction = "down";
      break;
    case "ArrowLeft":
      direction = "left";
      break;
  }

  if (direction && player.move(direction)) {
    steps++;
    stepsElement.innerText = steps;
  }
});

// Adiciona o botão de resolver
const solveButton = document.createElement("button");
solveButton.id = "solve-button";
solveButton.textContent = "Resolver Labirinto";
solveButton.addEventListener("click", () => {
  if (player) {
    steps = 0;
    stepsElement.innerText = steps;
    player.solveMaze();
  }
});

// Adiciona o botão de parar
const stopButton = document.getElementById("stop-button");
stopButton.addEventListener("click", () => {
  if (player) {
    player.stop();
  }
});

// Adiciona o botão à sidebar
const buttonsDiv = document.getElementById("buttons");
buttonsDiv.insertBefore(solveButton, buttonsDiv.firstChild);

export const generateMaze = () => {
  // Para a resolução atual se estiver em andamento
  if (player) {
    player.stop();
  }

  steps = 0;
  stepsElement.innerText = steps;
  document.getElementById("returns-value").innerText = "0";
  const { cols, rows } = generateGrid();
};

startButton.addEventListener("click", () => {
  mazeScreen.classList.remove("inactive");
  mazeScreen.classList.add("active");
  startScreen.classList.remove("active");
  startScreen.classList.add("inactive");
  generateMaze();
});
menuButton.addEventListener("click", () => {
  mazeScreen.classList.remove("active");
  mazeScreen.classList.add("inactive");
  startScreen.classList.remove("inactive");
  startScreen.classList.add("active");
});
resetButton.addEventListener("click", generateMaze);
window.addEventListener("resize", generateMaze);
