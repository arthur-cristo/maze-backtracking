import { Player } from "./playerService";

let steps = 0;
let player = null;
const stepsElement = document.getElementById("steps-value");

// Direções possíveis para mover (cima, direita, baixo, esquerda)
const directions = [
  [0, -1], // cima
  [1, 0],  // direita
  [0, 1],  // baixo
  [-1, 0]  // esquerda
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
      
      if (newX > x) { // direita
        cell.style.borderRight = "none";
        newCell.style.borderLeft = "none";
      } else if (newX < x) { // esquerda
        cell.style.borderLeft = "none";
        newCell.style.borderRight = "none";
      } else if (newY > y) { // baixo
        cell.style.borderBottom = "none";
        newCell.style.borderTop = "none";
      } else if (newY < y) { // cima
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
  
  // Inicializa o player após gerar o labirinto
  player = new Player(grid, cols, rows);
  
  return { cols, rows };
};

// Adiciona os controles de teclado
document.addEventListener('keydown', (event) => {
  if (!player) return;
  
  let direction = null;
  switch(event.key) {
    case 'ArrowUp':
      direction = 'up';
      break;
    case 'ArrowRight':
      direction = 'right';
      break;
    case 'ArrowDown':
      direction = 'down';
      break;
    case 'ArrowLeft':
      direction = 'left';
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

// Adiciona o botão à sidebar
const buttonsDiv = document.getElementById("buttons");
buttonsDiv.insertBefore(solveButton, buttonsDiv.firstChild);

export const generateMaze = () => {
  steps = 0;
  stepsElement.innerText = steps;
  const { cols, rows } = generateGrid();
};
