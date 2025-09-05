/**
 * This module re-exports the `useColorScheme` hook from `react-native`.
 *
 * The `useColorScheme` hook is a React hook that provides and subscribes to color scheme updates
 * from the `Appearance` module. It allows components to access the user's preferred color scheme
 * (e.g., 'light', 'dark', or `null`) and automatically re-render when it changes.
 *
 * By re-exporting it from this file, the project can have a centralized point of access for this
 * hook, which can be useful for platform-specific implementations or for adding custom logic
 * in the future. This file is for native platforms (iOS and Android), while `useColorScheme.web.ts`
 * provides the web-specific implementation.
 *
 * @returns {'light' | 'dark' | null | undefined} The user's current color scheme preference.
 */
export { useColorScheme } from 'react-native';
