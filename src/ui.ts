

class UIController {
  sceneContainer: HTMLElement;
  
  pause_popup: HTMLElement;

  lose_popup: HTMLElement;
  overlay: HTMLElement;

  loading: HTMLElement;
  loadingIcon: HTMLImageElement;

  countdownElement: HTMLElement;


  constructor() {
    this.sceneContainer = document.getElementById('scene-container') as HTMLElement;
    this.lose_popup = document.getElementById('lose-popup') as HTMLElement;
    this.overlay = document.getElementById('overlay') as HTMLElement;
    this.loading = document.getElementById('loading') as HTMLElement;
    this.loadingIcon = document.getElementById('loading-icon') as HTMLImageElement;

    this.pause_popup = document.getElementById('pause-popup') as HTMLElement;

    this.countdownElement = document.getElementById('countdown') as HTMLElement;

    const returnButton = document.getElementById('return-button') as HTMLElement;
    if (returnButton) {
      returnButton.addEventListener('click', this.returnToMain);
    }
  }

  loadingScreen() {
    const loadingImages = ["assets/pics/GaryRound.gif", "assets/pics/JellyJump.gif", "assets/pics/SpongeBobWalk.gif", "assets/pics/PatrickRun.gif"];
    const randomImage = loadingImages[Math.floor(Math.random() * loadingImages.length)];
    this.loadingIcon.src = randomImage;
    displayElement(this.loading);
  }

  removeLoadingScreen() {
    fadeElement(this.loading, 1, 0, true, 500);
  }


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
    // Display the pause popup and overlay
    console.log("pause in ui");
    displayElement(this.overlay, 0, 0.5, false, 500); // Dim the background
    displayElement(this.pause_popup, 0, 1, true, 500); // Show the popup
    
  }

  resume() {
    // Hide the pause popup and overlay
    fadeElement(this.overlay, 0.5, 0, true, 500);
    fadeElement(this.pause_popup, 1, 0, true, 500);
    
  }

  async countdown(count: number) {
    this.countdownElement.style.display = 'block';
    for (let i = count; i > 0; i--) {
      this.countdownElement.innerText = i.toString();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    this.countdownElement.style.display = 'none';
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