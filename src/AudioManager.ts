import { AudioLoader, AudioListener, Audio } from 'three';

export class AudioManager {
    private static instance: AudioManager;
    private bgmAudio: Audio | null = null;
    private collisionAudio: Audio | null = null;
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
                this.bgmAudio = await this.loadAudio('assets/audio/the-big-heist-188391.mp3', true);
            }
            this.bgmAudio.play();
        } catch (error) {
            console.error('Error loading BGM:', error);
        }
    }

    public async playCollisionSound(): Promise<void> {
        try {
            if (!this.collisionAudio) {
                this.collisionAudio = await this.loadAudio('assets/audio/boing-6222.mp3', false);
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