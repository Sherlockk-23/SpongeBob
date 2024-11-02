class InputHandler {
    keys: { [key: string]: boolean } = {};

    constructor() {
        this.addEventListeners();
    }

    addEventListeners() {
        window.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
        });

        window.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });
    }

    isKeyPressed(key: string): boolean {
        return this.keys[key] || false;
    }
}

export { InputHandler };