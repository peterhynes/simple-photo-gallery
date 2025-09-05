import { StyleSheet, Text, type TextProps } from 'react-native';
import { memo, useMemo } from 'react';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

/**
 * `ThemedText` is a memoized component that extends the standard React Native `Text` component
 * with theme-aware capabilities. It automatically adjusts its color based on the current
 * color scheme (light or dark) and provides predefined styles for different text types.
 *
 * This component is a fundamental building block for creating a consistent and theme-adaptive
 * user interface.
 *
 * Key features of the `ThemedText` component:
 * - **Theme-Aware Color:** It uses the `useThemeColor` hook to determine the appropriate text color.
 *   The color can be customized by passing `lightColor` and `darkColor` props. If these are not
 *   provided, it falls back to the default text color defined in the theme.
 * - **Predefined Text Styles:** The `type` prop allows you to apply predefined styles for common
 *   text roles, such as 'title', 'subtitle', 'link', and 'defaultSemiBold'. This helps maintain
 *   typographic consistency throughout the application.
 * - **Customization:** The component accepts a `style` prop to apply additional or override
 *   existing styles, allowing for flexible and specific styling needs.
 * - **Props Forwarding:** It forwards any other props to the underlying `Text` component, so you
 *   can use standard `Text` props like `onPress`, `numberOfLines`, etc.
 * - **Memoization:** The component is wrapped in `React.memo` to prevent unnecessary re-renders,
 *   optimizing performance.
 *
 * @param {ThemedTextProps} props - The props for the ThemedText component.
 * @param {StyleProp<TextStyle>} [props.style] - Custom styles to be applied to the text.
 * @param {string} [props.lightColor] - The color of the text in light mode.
 * @param {string} [props.darkColor] - The color of the text in dark mode.
 * @param {'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'} [props.type='default'] - The predefined style type for the text.
 * @param {object} props.rest - Any other props to be passed to the underlying `Text` component.
 * @returns {React.ReactElement} The rendered themed text component.
 */
export const ThemedText = memo(function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const typeStyle = useMemo(() => {
    switch (type) {
      case 'title':
        return styles.title;
      case 'defaultSemiBold':
        return styles.defaultSemiBold;
      case 'subtitle':
        return styles.subtitle;
      case 'link':
        return styles.link;
      default:
        return styles.default;
    }
  }, [type]);

  return (
    <Text
      style={[{ color }, typeStyle, style]}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
