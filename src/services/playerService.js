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

    // Limpa o estado anterior
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: light)").matches
        )
          this.grid[y][x].style.backgroundColor = "white";
        else this.grid[y][x].style.backgroundColor = "#1a1a1a";
      }
    }

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

    const success = await this.backtrack(this.x, this.y, endX, endY);

    if (success) {
      console.log("Labirinto resolvido!");
      await this.showSolution();
    } else {
      console.log("Não foi possível encontrar uma solução!");
      this.resetToStart();
    }

    this.isSolving = false;
  }

  async backtrack(x, y, endX, endY) {
    // Se chegou ao final, retorna sucesso
    if (x === endX && y === endY) {
      this.solutionPath = [...this.stack];
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
        // Move o robô visualmente
        // Azul claro para caminho visitado
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

        // Tenta resolver a partir da nova posição
        if (await this.backtrack(newX, newY, endX, endY)) {
          return true;
        }

        // Se não deu certo, volta
        this.stack.pop();
        // Laranja claro para caminho errado
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
        if (this.grid[y][x].style.backgroundColor !== "#4CAF50") {
          if (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: light)").matches
          )
            this.grid[y][x].style.backgroundColor = "white";
          else this.grid[y][x].style.backgroundColor = "#1a1a1a";
        }
      }
    }

    // Mostra o caminho da solução
    for (const [x, y] of this.solutionPath) {
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
}
