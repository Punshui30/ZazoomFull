import { logger } from '../utils/logger';

class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private ws: WebSocket | null = null;
  private audioQueue: Float32Array[] = [];
  private _isPlaying = false;
  private volume = 0.7;
  private hasError = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeAudioContext();
    this.connectWebSocket();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.volume;
    } catch (error) {
      logger.error('Failed to initialize AudioContext:', error);
      this.hasError = true;
    }
  }

  private connectWebSocket() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Close existing connection if any
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }

      this.ws = new WebSocket('wss://165.227.111.7/audio');
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        logger.info('WebSocket connection established');
        this.reconnectAttempts = 0;
        this.hasError = false;
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
        // Auto-start playing when connection is established
        if (!this._isPlaying) {
          this.play();
        }
      };

      this.ws.onmessage = async (event) => {
        if (event.data instanceof ArrayBuffer) {
          const audioData = new Float32Array(event.data);
          this.audioQueue.push(audioData);
          
          if (this._isPlaying && this.audioQueue.length > 0) {
            await this.processAudioQueue();
          }
        }
      };

      this.ws.onerror = (error) => {
        logger.error('WebSocket error:', error);
        this.handleConnectionError();
      };

      this.ws.onclose = (event) => {
        logger.warn('WebSocket connection closed:', event.code, event.reason);
        this.handleConnectionError();
      };

    } catch (error) {
      logger.error('Failed to connect WebSocket:', error);
      this.handleConnectionError();
    }
  }

  private handleConnectionError() {
    this.hasError = true;

    // Clear any existing reconnection timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      logger.info(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connectWebSocket();
      }, delay);
    } else {
      logger.error('Max reconnection attempts reached');
    }
  }

  private async processAudioQueue() {
    if (!this.audioContext || !this.gainNode || this.audioQueue.length === 0 || !this._isPlaying) {
      return;
    }

    try {
      const audioData = this.audioQueue.shift();
      if (!audioData) return;

      const audioBuffer = this.audioContext.createBuffer(1, audioData.length, this.audioContext.sampleRate);
      audioBuffer.getChannelData(0).set(audioData);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);
      
      source.onended = () => {
        source.disconnect();
        if (this._isPlaying) {
          this.processAudioQueue();
        }
      };

      source.start();
      this.sourceNode = source;

    } catch (error) {
      logger.error('Error processing audio queue:', error);
      this.handleConnectionError();
    }
  }

  public play() {
    if (this.hasError || !this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      this._isPlaying = true;
      this.processAudioQueue();
    } catch (error) {
      logger.error('Error playing audio:', error);
      this.handleConnectionError();
    }
  }

  public stop() {
    try {
      this._isPlaying = false;
      if (this.sourceNode) {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      this.audioQueue = [];
    } catch (error) {
      logger.error('Error stopping audio:', error);
    }
  }

  public get isPlaying(): boolean {
    return this._isPlaying && !this.hasError;
  }

  public hasPlaybackError(): boolean {
    return this.hasError;
  }

  public cleanup() {
    this.stop();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export const audioManager = AudioManager.getInstance();