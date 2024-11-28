import { AudioLoader, AudioListener, Audio } from 'three';

export class AudioManager {
    private static instance: AudioManager;
    private bgmAudio: Audio | null = null;
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

    public async loadAndPlayBGM(): Promise<void> {
        try {
            if (!this.bgmAudio) {
                this.bgmAudio = new Audio(this.listener);
            }

            // Load the BGM file
            const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
                this.audioLoader.load(
                    'assets/audio/the-big-heist-188391.mp3', // Update this path to match your actual BGM file path
                    resolve,
                    undefined,
                    reject
                );
            });

            this.bgmAudio.setBuffer(audioBuffer);
            this.bgmAudio.setLoop(true);
            this.bgmAudio.setVolume(0.5);
            this.bgmAudio.play();
        } catch (error) {
            console.error('Error loading BGM:', error);
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
}