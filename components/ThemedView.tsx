import { View, type ViewProps } from 'react-native';
import { memo } from 'react';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

/**
 * `ThemedView` is a memoized component that extends the standard React Native `View` component
 * with theme-aware capabilities. It automatically sets its background color based on the current
 * color scheme (light or dark).
 *
 * This component is a foundational element for building a themed user interface, ensuring that
 * container elements and backgrounds adapt to the user's preferred theme.
 *
 * Key features of the `ThemedView` component:
 * - **Theme-Aware Background Color:** It uses the `useThemeColor` hook to determine the appropriate
 *   background color. The color can be customized by passing `lightColor` and `darkColor` props.
 *   If these are not provided, it falls back to the default background color defined in the theme.
 * - **Customization:** The component accepts a `style` prop to apply additional or override
 *   existing styles, allowing for flexible layout and design.
 * - **Props Forwarding:** It forwards any other props to the underlying `View` component, so you
 *   can use standard `View` props like `onLayout`, `pointerEvents`, etc.
 * - **Memoization:** The component is wrapped in `React.memo` to prevent unnecessary re-renders,
 *   which helps in optimizing the performance of the application.
 *
 * @param {ThemedViewProps} props - The props for the ThemedView component.
 * @param {StyleProp<ViewStyle>} [props.style] - Custom styles to be applied to the view.
 * @param {string} [props.lightColor] - The background color of the view in light mode.
 * @param {string} [props.darkColor] - The background color of the view in dark mode.
 * @param {object} props.otherProps - Any other props to be passed to the underlying `View` component.
 * @returns {React.ReactElement} The rendered themed view component.
 */
export const ThemedView = memo(function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
});
