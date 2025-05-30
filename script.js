class MazeGenerator {
  constructor(size = 21) {
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
      generateMaze: document.getElementById("generateMaze"),
      solveMaze: document.getElementById("solveMaze"),
      mazeSizeInput: document.getElementById("mazeSize"),
    };

    this.maze = [];
    this.size = 21;
    this.currentPosition = { x: 1, y: 1 };
    this.endPosition = {};
    this.visited = [];
    this.path = [];
    this.solving = false;

    this.setupListeners();
    this.generateMaze();
  }

  setupListeners() {
    this.elements.generateMaze.addEventListener("click", () =>
      this.generateMaze()
    );
    this.elements.solveMaze.addEventListener("click", () => this.solveMaze());
  }

  generateMaze() {
    const size = parseInt(this.elements.mazeSizeInput.value);
    if (size < 5 || size > 99 || size % 2 === 0) {
      alert("Please enter an odd number between 5 and 99.");
      return;
    }

    const generator = new MazeGenerator(size);
    this.maze = generator.getMaze();
    this.size = generator.getSize();
    this.currentPosition = { x: 1, y: 1 };
    this.endPosition = { x: this.size - 2, y: this.size - 2 };
    this.visited = [];
    this.path = [];

    this.renderMaze();
  }

  renderMaze() {
    this.elements.maze.innerHTML = "";
    this.elements.maze.style.gridTemplateColumns = `repeat(${this.size}, 20px)`;

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        if (this.maze[i][j] === 1) cell.classList.add("wall");
        else if (i === 1 && j === 1) cell.classList.add("start");
        else if (i === this.endPosition.x && j === this.endPosition.y)
          cell.classList.add("end");

        this.elements.maze.appendChild(cell);
      }
    }
  }

  solveMaze() {
    if (this.solving) return;

    this.solving = true;
    this.elements.solveMaze.disabled = true;
    this.visited = [];
    this.path = [];

    this.backtrack(this.currentPosition.x, this.currentPosition.y)
      .then((found) => {
        if (!found) {
          alert("No path found.");
        } else {
          this.clearTemporaryMarks();
          this.showFinalPath();
        }
      })
      .finally(() => {
        this.solving = false;
        this.elements.solveMaze.disabled = false;
      });
  }

  async backtrack(x, y) {
    if (x === this.endPosition.x && y === this.endPosition.y) {
      this.path.push({ x, y });
      return true;
    }

    if (
      this.maze[x][y] !== 0 ||
      this.visited.some((p) => p.x === x && p.y === y)
    )
      return false;

    this.visited.push({ x, y });
    await this.markPath(x, y, true);

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
        return true;
      }
    }

    await this.markPath(x, y, false);
    return false;
  }

  async markPath(x, y, correct) {
    const index = x * this.size + y;
    const cell = this.elements.maze.children[index];

    if (x === 1 && y === 1) return;
    if (x === this.endPosition.x && y === this.endPosition.y) return;

    const prevPlayer = this.elements.maze.querySelector(".player");
    if (prevPlayer) prevPlayer.classList.remove("player");

    cell.classList.remove("visited", "path");
    cell.classList.add(correct ? "path" : "visited", "player");

    await new Promise((resolve) => setTimeout(resolve, 60));
  }

  clearTemporaryMarks() {
    const cells = this.elements.maze.children;
    for (let i = 0; i < cells.length; i++) {
      cells[i].classList.remove("visited", "path", "player");
    }
  }

  async showFinalPath() {
    const reversed = this.path.reverse();
    for (let i = 0; i < reversed.length; i++) {
      const step = reversed[i];
      const index = step.x * this.size + step.y;
      const cell = this.elements.maze.children[index];

      if (
        (step.x === 1 && step.y === 1) ||
        (step.x === this.endPosition.x && step.y === this.endPosition.y)
      )
        continue;

      // Clear previous player
      const previousPlayer = this.elements.maze.querySelector(".player");
      if (previousPlayer) previousPlayer.classList.remove("player");

      cell.classList.add("solution", "player");

      await new Promise((res) => setTimeout(res, 50));
    }

    // Final position
    const finalIndex = this.endPosition.x * this.size + this.endPosition.y;
    this.elements.maze.children[finalIndex].classList.add("player");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new MazeGame();
});

const mazeSizeInput = document.getElementById("mazeSize");
const mazeSizeValue = document.getElementById("mazeSizeValue");

mazeSizeInput.addEventListener("input", () => {
  mazeSizeValue.textContent = mazeSizeInput.value;
});
