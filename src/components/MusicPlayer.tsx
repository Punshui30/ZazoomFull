import React from 'react';
import { AudioContext } from '../lib/audioContext';
import { audioManager } from '../lib/audio';

export function MusicPlayer({ children }: { children: React.ReactNode }) {
  const contextValue = {
    play: audioManager.play.bind(audioManager),
    stop: audioManager.stop.bind(audioManager),
    isPlaying: audioManager.isPlaying,
    hasError: audioManager.hasPlaybackError()
  };

  // Start playing automatically
  React.useEffect(() => {
    audioManager.play();
    return () => audioManager.cleanup();
  }, []);

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}