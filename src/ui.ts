

class UIController {
  sceneContainer: HTMLElement;
  menu: HTMLElement;
  replay: HTMLElement;
  instructions: HTMLElement;
  win_banner: HTMLElement;
  lose_banner: HTMLElement;
  lose_popup: HTMLElement;
  overlay: HTMLElement;


  constructor() {
    this.sceneContainer = document.getElementById('scene-container') as HTMLElement;
    this.menu = document.getElementById('menu') as HTMLElement;
    this.replay = document.getElementById('replayMessage') as HTMLElement;
    this.instructions = document.getElementById('instructions') as HTMLElement;
    this.win_banner = document.getElementById('win-banner') as HTMLElement;
    this.lose_banner = document.getElementById('lose-banner') as HTMLElement;
    this.lose_popup = document.getElementById('lose-popup') as HTMLElement;
    this.overlay = document.getElementById('overlay') as HTMLElement;

    const returnButton = document.getElementById('return-button') as HTMLElement;
    if (returnButton) {
      returnButton.addEventListener('click', this.returnToMain);
    }
  }

  showMenu() {
    displayElement(this.menu);
    displayElement(this.instructions);
    displayElement(this.replay);
  }

  shallowMenu() {
    displayElement(this.menu, 0.9, 0.5, false, 1500);
    displayElement(this.instructions, 0.9, 0.5, false, 1500);
    displayElement(this.replay, 0.9, 0.5, false, 1500);
  }

  fadeMenu() {
    fadeElement(this.menu);
    fadeElement(this.instructions);
    fadeElement(this.replay);
  }

  // lose() {
  //     displayElement(this.lose_banner);
  // }

  // restart() {
  //     fadeElement(this.lose_banner);
  // }

  lose() {
    // Display the lose popup and overlay
    displayElement(this.overlay, 0, 0.5, false, 500); // Dim the background
    displayElement(this.lose_popup, 0, 1, true, 500); // Show the popup
  }

  restart() {
    // Hide the lose popup and overlay
    fadeElement(this.overlay, 0.5, 0, true, 500);
    fadeElement(this.lose_popup, 1, 0, true, 500);
  }

  pause() {
    this.showMenu();
  }

  resume() {
    this.fadeMenu();
  }

  returnToMain() {
    window.location.href = 'index.html'; // Navigate to index.html
  }
}

export { UIController };

const startButton = document.getElementById("start-button");

if (startButton) {
  startButton.addEventListener("click", () => {
    // Hide the button
    startButton.style.display = "none";
    // Call a function to start the game
    startGame();
  });
}

function startGame() {
  // Assuming `game` is initialized in this file or elsewhere
  console.log("Game Starting...");
  // Dispatch custom logic to notify the game logic to start
  window.dispatchEvent(new Event("gameStart"));
}

function fadeElement(element: HTMLElement, init_opacity: number = 1, final_opacity: number = 0, remove: boolean = true, duration: number = 500) {
  var op = init_opacity;  // initial opacity
  const timeInterval = 10; // in ms
  var decrement = (init_opacity - final_opacity) * timeInterval / duration;
  var timer = setInterval(function () {
    if (op <= final_opacity) {
      element.style.opacity = final_opacity.toString();
      element.style.filter = 'alpha(opacity=' + final_opacity * 100 + ")";
      clearInterval(timer);
      if (remove) {
        element.style.display = 'none';
      }
    }
    //   console.log("element is ",element);
    element.style.opacity = op.toString();
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    op -= decrement;
  }, timeInterval);
}

function displayElement(element: HTMLElement, init_opacity: number = 0, final_opacity: number = 1, removed: boolean = true, duration: number = 500) {
  var op = init_opacity;  // initial opacity
  const timeInterval = 10; // in ms
  var increment = (final_opacity - init_opacity) * timeInterval / duration;
  if (removed) {
    element.style.display = 'block';
  }
  var timer = setInterval(function () {
    if (op >= final_opacity) {
      element.style.opacity = final_opacity.toString();
      element.style.filter = 'alpha(opacity=' + final_opacity * 100 + ")";
      clearInterval(timer);
    }
    //   console.log("element is ",element);
    element.style.opacity = op.toString();
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    op += increment;
  }, timeInterval);
}