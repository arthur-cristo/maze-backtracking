import { formatTime } from "../utils";

let time = 0;
let steps = 0;
const timerElement = document.getElementById("time-value");
const stepsElement = document.getElementById("steps-value");

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

  for (let row = 0; row < rows; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("maze-row");
    rowDiv.style.display = "flex";
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("div");
      cell.classList.add("maze-cell");
      cell.style.width = `${cellWidth}px`;
      cell.style.height = `${cellHeight}px`;
      cell.style.boxSizing = "border-box";
      cell.style.border = "1px solid black";
      cell.style.backgroundColor = "white";
      rowDiv.appendChild(cell);
    }
    maze.appendChild(rowDiv);
  }
  return { cols, rows };
};

export const generateMaze = () => {
  time = 0;
  steps = 0;
  timerElement.innerText = formatTime(time);
  stepsElement.innerText = steps;
  const { cols, rows } = generateGrid();
};
