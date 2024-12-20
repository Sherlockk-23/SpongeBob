class UIController {
  sceneContainer: HTMLElement;
  pause_popup: HTMLElement;
  lose_popup: HTMLElement;
  overlay: HTMLElement;
  loading: HTMLElement;
  loadingIcon: HTMLImageElement;
  countdownElement: HTMLElement;
  itemIcon: HTMLImageElement;
  current_item: string;
  sentenceElement: HTMLElement;

  constructor() {
    this.sceneContainer = document.getElementById('scene-container') as HTMLElement;
    this.lose_popup = document.getElementById('lose-popup') as HTMLElement;
    this.overlay = document.getElementById('overlay') as HTMLElement;
    this.loading = document.getElementById('loading') as HTMLElement;
    this.loadingIcon = document.getElementById('loading-icon') as HTMLImageElement;
    this.itemIcon = document.getElementById('item-icon') as HTMLImageElement;
    this.pause_popup = document.getElementById('pause-popup') as HTMLElement;
    this.countdownElement = document.getElementById('countdown') as HTMLElement;
    this.sentenceElement = document.createElement('div');
    this.sentenceElement.id = 'sentence-element';
    document.body.appendChild(this.sentenceElement);

    const returnButton = document.getElementById('return-button') as HTMLElement;
    if (returnButton) {
      returnButton.addEventListener('click', this.returnToMain);
    }
  }

  loadingScreen() {
    const loadingImages = ["assets_/pics/GaryRound.gif", "assets_/pics/JellyJump.gif", "assets_/pics/SpongeBobWalk.gif", "assets_/pics/PatrickRun.gif"];
    const randomImage = loadingImages[Math.floor(Math.random() * loadingImages.length)];
    this.loadingIcon.src = randomImage;
    displayElement(this.loading);
  }

  removeLoadingScreen() {
    fadeElement(this.loading, 1, 0, true, 500);
  }

  swapItem(item: string) {
    if (this.current_item === item) {
      return;
    }
    console.log("debuging effects. fello from ui's item ", item);
    this.current_item = item;
    this.itemIcon.src = `assets_/pics/items/${item}.png`;
  }

  waitReady() {
    displayElement(this.overlay, 0, 0.5, false, 500);
    
  }

  lose() {
    displayElement(this.overlay, 0, 0.5, false, 500);
    displayElement(this.lose_popup, 0, 1, true, 500);
  }

  restart() {
    fadeElement(this.overlay, 0.5, 0, true, 500);
    fadeElement(this.lose_popup, 1, 0, true, 500);
  }

  pause() {
    console.log("pause in ui");
    displayElement(this.overlay, 0, 0.5, false, 500);
    displayElement(this.pause_popup, 0, 1, true, 500);
  }

  resume() {
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
    window.location.href = 'Instructions.html';
  }

  async showSentence(text: string, type: 'title' | 'notice', duration: number = 3000) {
    this.sentenceElement.innerText = text;
    this.sentenceElement.style.display = 'block';
    this.sentenceElement.style.opacity = '0';
    this.sentenceElement.style.fontFamily = 'Arial, sans-serif'; // Change font
    this.sentenceElement.style.fontWeight = 'bold'; // Bold text
    this.sentenceElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)'; // Add shadow
  
    if (type === 'title') {
      this.sentenceElement.style.position = 'fixed';
      this.sentenceElement.style.top = '10%';
      this.sentenceElement.style.left = '50%';
      this.sentenceElement.style.transform = 'translateX(-50%)';
      this.sentenceElement.style.fontSize = '5vh';
      this.sentenceElement.style.color = 'green';
    } else if (type === 'notice') {
      this.sentenceElement.style.position = 'fixed';
      this.sentenceElement.style.bottom = '10%';
      this.sentenceElement.style.left = '50%';
      this.sentenceElement.style.transform = 'translateX(-50%)';
      this.sentenceElement.style.fontSize = '3vh';
      this.sentenceElement.style.color = 'red';
    }
  
    displayElement(this.sentenceElement, 0, 1, false, 500);
    await new Promise(resolve => setTimeout(resolve, duration));
    fadeElement(this.sentenceElement, 1, 0, true, 500);
  }
}

export { UIController };

const startButton = document.getElementById("start-button");

if (startButton) {
  startButton.addEventListener("click", () => {
    startButton.style.display = "none";
    startGame();
  });
}

function startGame() {
  console.log("Game Starting...");
  window.dispatchEvent(new Event("gameStart"));
}

function fadeElement(element: HTMLElement, init_opacity: number = 1, final_opacity: number = 0, remove: boolean = true, duration: number = 500) {
  var op = init_opacity;
  const timeInterval = 10;
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
    element.style.opacity = op.toString();
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    op -= decrement;
  }, timeInterval);
}

function displayElement(element: HTMLElement, init_opacity: number = 0, final_opacity: number = 1, removed: boolean = true, duration: number = 500) {
  var op = init_opacity;
  const timeInterval = 10;
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
    element.style.opacity = op.toString();
    element.style.filter = 'alpha(opacity=' + op * 100 + ")";
    op += increment;
  }, timeInterval);
}