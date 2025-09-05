import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

/**
 * `BlurTabBarBackground` is an iOS-specific component that creates a blurred background for the
 * tab bar, mimicking the native iOS tab bar appearance. It uses the `BlurView` component from
 * `expo-blur` to achieve this effect.
 *
 * This component is designed to be used as the `tabBarBackground` for a React Navigation
 * bottom tab navigator on iOS.
 *
 * The `tint` prop is set to `systemChromeMaterial`, which is a special tint that automatically
 * adapts to the system's theme (light or dark). This ensures that the tab bar's appearance
 * is consistent with the native iOS UI. The `intensity` is set to 100 for a standard blur effect.
 *
 * The component's style is set to `StyleSheet.absoluteFill`, which makes it fill the entire
 * area of its parent (the tab bar), creating a complete background.
 *
 * @returns {React.ReactElement} The rendered blur view component for the tab bar background.
 */
export default function BlurTabBarBackground() {
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

/**
 * `useBottomTabOverflow` is a hook that provides the height of the bottom tab bar.
 * This is particularly useful on iOS when the tab bar has a blurred, translucent background,
 * and content needs to scroll underneath it.
 *
 * By getting the tab bar height, you can add padding to the bottom of your content or adjust
 * scroll view insets to ensure that the content is not permanently obscured by the tab bar.
 *
 * This hook is a direct wrapper around `useBottomTabBarHeight` from `@react-navigation/bottom-tabs`,
 * providing a consistent API with its non-iOS counterpart, which may have a different implementation.
 *
 * @returns {number} The height of the bottom tab bar.
 */
export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
