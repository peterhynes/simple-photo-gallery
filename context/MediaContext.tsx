import React, { createContext, useState, useContext, PropsWithChildren } from 'react';
import * as MediaLibrary from 'expo-media-library';

/**
 * Defines the shape of the data stored in the MediaContext.
 */
interface MediaContextData {
  /** The array of media assets from the device's library. */
  assets: MediaLibrary.Asset[];
  /** Function to completely replace the assets array. */
  setAssets: (assets: MediaLibrary.Asset[]) => void;
  /** Function to append new assets to the existing array. */
  addAssets: (assets: MediaLibrary.Asset[]) => void;
  /** Function to prepend a single asset to the beginning of the array. */
  prependAsset: (asset: MediaLibrary.Asset) => void;
}

/**
 * `MediaContext` is a React Context created to provide a global state for the media assets
 * fetched from the user's library. This avoids the need to pass the assets array as a navigation
 * parameter, which is inefficient and not scalable.
 */
const MediaContext = createContext<MediaContextData | undefined>(undefined);

/**
 * `MediaProvider` is a component that supplies the `MediaContext` to its children.
 * It encapsulates the state management for the media assets, holding the `assets` array
 * and providing functions to modify it (`setAssets`, `addAssets`).
 *
 * @param {PropsWithChildren} props - The props for the MediaProvider component.
 * @param {React.ReactNode} props.children - The child components that will have access to the context.
 * @returns {React.ReactElement} The provider component wrapping its children.
 */
export const MediaProvider = ({ children }: PropsWithChildren) => {
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);

  const addAssets = (newAssets: MediaLibrary.Asset[]) => {
    setAssets((prevAssets) => [...prevAssets, ...newAssets]);
  };

  const prependAsset = (newAsset: MediaLibrary.Asset) => {
    setAssets((prevAssets) => [newAsset, ...prevAssets]);
  };

  const value = { assets, setAssets, addAssets, prependAsset };

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};

/**
 * `useMedia` is a custom hook that provides a convenient way for components to access the
 * `MediaContext`. It simplifies the process of consuming the context by handling the
 * `useContext` call and error checking.
 *
 * @throws {Error} If the hook is used outside of a `MediaProvider`.
 * @returns {MediaContextData} The context data, including the assets and functions to modify them.
 */
export const useMedia = () => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};
