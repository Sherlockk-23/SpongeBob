import { Game } from "./src/game";

interface CustomWindow extends Window {
  game: any;
}

declare let window: CustomWindow;

function main() {
  const game = new Game();
  window.game = game;
}

main();
