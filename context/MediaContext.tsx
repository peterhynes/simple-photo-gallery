import React, { createContext, useState, useContext, PropsWithChildren } from 'react';
import * as MediaLibrary from 'expo-media-library';

// Define the shape of the context data
interface MediaContextData {
  assets: MediaLibrary.Asset[];
  setAssets: (assets: MediaLibrary.Asset[]) => void;
  addAssets: (assets: MediaLibrary.Asset[]) => void;
}

// Create the context with a default value
const MediaContext = createContext<MediaContextData | undefined>(undefined);

// Create a provider component
export const MediaProvider = ({ children }: PropsWithChildren) => {
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);

  const addAssets = (newAssets: MediaLibrary.Asset[]) => {
    setAssets((prevAssets) => [...prevAssets, ...newAssets]);
  };

  const value = { assets, setAssets, addAssets };

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};

// Create a custom hook to use the media context
export const useMedia = () => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};
