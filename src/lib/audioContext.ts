import { createContext, useContext } from 'react';

interface AudioContextType {
  play: () => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  hasError: boolean;
}

export const AudioContext = createContext<AudioContextType>({
  play: async () => {},
  stop: () => {},
  isPlaying: false,
  hasError: false
});

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};