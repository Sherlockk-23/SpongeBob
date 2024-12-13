import { AudioLoader, AudioListener, Audio } from 'three';

export class AudioManager {
    private static instance: AudioManager;
    private bgmAudio: Audio | null = null;
    private collisionAudio: Audio | null = null;
    private pickItemAudio: Audio | null = null;
    private breakAudio: Audio | null = null;
    private windAudio: Audio | null = null;
    private fallAudio: Audio | null = null;
    private squeakAudio: Audio | null = null;
    private roboticAudio: Audio | null = null;
    private danceAudio: Audio | null = null;
    warningAudio: Audio | null = null;
    private audioLoader: AudioLoader;
    private listener: AudioListener;

    private constructor() {
        this.audioLoader = new AudioLoader();
        this.listener = new AudioListener();
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    public getListener(): AudioListener {
        return this.listener;
    }

    private async loadAudio(path: string, loop: boolean = false, volume: number = 0.5): Promise<Audio> {
        const audio = new Audio(this.listener);

        try {
            const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
                this.audioLoader.load(
                    path,
                    resolve,
                    undefined,
                    reject
                );
            });

            audio.setBuffer(audioBuffer);
            audio.setLoop(loop);
            audio.setVolume(volume);
            return audio;
        } catch (error) {
            console.error(`Error loading audio from ${path}:`, error);
            throw error;
        }
    }

    public async loadAndPlayBGM(): Promise<void> {
        try {
            if (!this.bgmAudio) {
                this.bgmAudio = await this.loadAudio('assets_/audio/the-big-heist-188391.mp3', true);
            }
            this.bgmAudio.play();
        } catch (error) {
            console.error('Error loading BGM:', error);
        }
    }

    public async playBoundingSound(): Promise<void> {
        try {
            if (!this.collisionAudio) {
                this.collisionAudio = await this.loadAudio('assets_/audio/boing-6222.mp3', false);
            }

            // If the sound is already playing, stop it first
            if (this.collisionAudio.isPlaying) {
                this.collisionAudio.stop();
            }

            this.collisionAudio.play();
        } catch (error) {
            console.error('Error playing collision sound:', error);
        }
    }
    public async playPickItemSound(): Promise<void> {
        try {
            if (!this.pickItemAudio) {
                this.pickItemAudio = await this.loadAudio('assets_/audio/pickItem.mp3', false);
            }

            // If the sound is already playing, stop it first
            if (this.pickItemAudio.isPlaying) {
                this.pickItemAudio.stop();
            }

            this.pickItemAudio.play();
        } catch (error) {
            console.error('Error playing pickItemAudio: ', error);
        }
    }
    public async playBreakSound(): Promise<void> {
        try {
            if (!this.breakAudio) {
                this.breakAudio = await this.loadAudio('assets_/audio/break.mp3', false);
            }

            // If the sound is already playing, stop it first
            if (this.breakAudio.isPlaying) {
                this.breakAudio.stop();
            }

            this.breakAudio.play();
        } catch (error) {
            console.error('Error playing breakAudio: ', error);
        }
    }

    public async playWarningSound(): Promise<void> {
        try {
            if (!this.warningAudio) {
                this.warningAudio = await this.loadAudio('assets_/audio/warning.mp3', false);
            }

            // If the sound is already playing, stop it first
            if (this.warningAudio.isPlaying) {
                this.warningAudio.stop();
            }

            this.warningAudio.play();
        } catch (error) {
            console.error('Error playing warning sound:', error);
        }
    }

    public async playWindSound(): Promise<void> {
        try {
            if (!this.windAudio) {
                this.windAudio = await this.loadAudio('assets_/audio/wind.mp3', false);
            }

            // If the sound is already playing, stop it first
            if (this.windAudio.isPlaying) {
                this.windAudio.stop();
            }

            this.windAudio.play();
        } catch (error) {
            console.error('Error playing windAudio: ', error);
        }
    }

    public async playFallSound(): Promise<void> {
        try {
            if (!this.fallAudio) {
                this.fallAudio = await this.loadAudio('assets_/audio/fall.mp3', false);
            }

            // If the sound is already playing, stop it first
            if (this.fallAudio.isPlaying) {
                this.fallAudio.stop();
            }

            this.fallAudio.play();
        } catch (error) {
            console.error('Error playing warning sound:', error);
        }
    }

    public async playSqueakSound(): Promise<void> {
        try {
            if (!this.squeakAudio) {
                this.squeakAudio = await this.loadAudio('assets_/audio/squeak.mp3', false);
            }

            // If the sound is already playing, stop it first
            if (this.squeakAudio.isPlaying) {
                this.squeakAudio.stop();
            }

            this.squeakAudio.play();
        } catch (error) {
            console.error('Error playing squeakAudio: ', error);
        }
    }

    public async playRoboticSound(): Promise<void> {
        try {
            if (!this.roboticAudio) {
                this.roboticAudio = await this.loadAudio('assets_/audio/robotic.mp3', false);
            }

            // If the sound is already playing, stop it first
            if (this.roboticAudio.isPlaying) {
                this.roboticAudio.stop();
            }

            this.roboticAudio.play();
        } catch (error) {
            console.error('Error playing roboticAudio: ', error);
        }
    }

    public async playDanceSound(): Promise<void> {
        try {
            if (!this.danceAudio) {
                this.danceAudio = await this.loadAudio('assets_/audio/dance.mp3', false);
            }

            // If the sound is already playing, stop it first
            if (this.danceAudio.isPlaying) {
                this.danceAudio.stop();
            }

            this.danceAudio.play();
        } catch (error) {
            console.error('Error playing danceAudio: ', error);
        }
    }

    public stopBGM(): void {
        if (this.bgmAudio) {
            this.bgmAudio.stop();
        }
    }

    public pauseBGM(): void {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
        }
    }

    public resumeBGM(): void {
        if (this.bgmAudio) {
            this.bgmAudio.play();
        }
    }

    public setBGMVolume(volume: number): void {
        if (this.bgmAudio) {
            this.bgmAudio.setVolume(Math.max(0, Math.min(1, volume)));
        }
    }

    public setCollisionVolume(volume: number): void {
        if (this.collisionAudio) {
            this.collisionAudio.setVolume(Math.max(0, Math.min(1, volume)));
        }
    }
}