

class UIController {
    sceneContainer: HTMLElement;
    menu: HTMLElement;
    replay: HTMLElement;
    instructions: HTMLElement;
    win_banner: HTMLElement;
    lose_banner: HTMLElement;


    constructor() {
        this.sceneContainer = document.getElementById('scene-container')as HTMLElement;
        this.menu = document.getElementById('menu')as HTMLElement;
        this.replay = document.getElementById('replayMessage')as HTMLElement;
        this.instructions = document.getElementById('instructions')as HTMLElement;
        this.win_banner = document.getElementById('win-banner')as HTMLElement;
        this.lose_banner = document.getElementById('lose-banner')as HTMLElement;

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

    lose() {
        displayElement(this.lose_banner);
    }

    restart() {
        fadeElement(this.lose_banner);
    }

    pause(){
       this.showMenu();
    }

    resume(){
        this.fadeMenu();
    }
    
    
}

export {UIController};

function fadeElement(element: HTMLElement, init_opacity: number=1, final_opacity: number=0, remove: boolean=true, duration: number=500) {
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
  
function displayElement(element: HTMLElement, init_opacity: number=0, final_opacity: number=1, removed: boolean=true, duration: number=500) {
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
  
  
//   function fadeBackGround(element: HTMLElement, init_opacity: number, final_opacity: number, remove: boolean, duration: number) {
//     var op = init_opacity;  // initial opacity
  
//     // initial rgb
//     const bgColor = window.getComputedStyle(element).backgroundColor;
//     const rgbRegex = /rgb\((\d+), (\d+), (\d+)\)/;
//     const match = rgbRegex.exec(bgColor);
//     if (match == null) {
//       return;
//     }
//     const r = match[1];
//     const g = match[2];
//     const b = match[3];
  
//     const timeInterval = 2; //in ms
//     var decrement = (init_opacity - final_opacity) * timeInterval / duration;
//     var timer = setInterval(function () {
//       if (op <= final_opacity) {
//         element.style.background = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + final_opacity + ')';
//         clearInterval(timer);
//         if (remove) {
//           element.style.display = 'none';
//         }
//       }
//       element.style.background = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + op + ')';
//       op -= decrement;
//     }, timeInterval);
//   }