import { generateMaze } from "./services/mazeService";

// Screens
const startScreen = document.getElementById("start-screen");
const mazeScreen = document.getElementById("maze-screen");

// Buttons
const startButton = document.getElementById("start-button");
startButton.addEventListener("click", () => {
  mazeScreen.classList.remove("inactive");
  mazeScreen.classList.add("active");
  startScreen.classList.remove("active");
  startScreen.classList.add("inactive");
  generateMaze();
});

const menuButton = document.getElementById("menu-button");
menuButton.addEventListener("click", () => {
  mazeScreen.classList.remove("active");
  mazeScreen.classList.add("inactive");
  startScreen.classList.remove("inactive");
  startScreen.classList.add("active");
});

const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", generateMaze);
window.addEventListener("resize", generateMaze);
