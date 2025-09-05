/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * `useThemeColor` is a custom hook that provides a color value based on the current theme
 * (light or dark). It allows components to easily access theme-specific colors, promoting
 * consistency and simplifying the implementation of theme-aware components.
 *
 * This hook follows a specific logic to determine the color to be returned:
 * 1. **Check for Prop-based Colors:** It first checks if a color for the current theme is
 *    provided in the `props` object. For example, if the current theme is 'light', it looks
 *    for `props.light`. If a color is found, it is returned immediately. This allows for
 *    component-level overrides of theme colors.
 * 2. **Fall Back to Theme-defined Colors:** If no color is provided in the props, the hook
 *    falls back to the global color palette defined in `constants/Colors.ts`. It uses the
 *    `colorName` argument to look up the appropriate color in the `Colors` object for the
 *    current theme (e.g., `Colors.light.text`).
 *
 * The hook uses `useColorScheme` to get the current theme, and it defaults to 'light' if the
 * theme is not set.
 *
 * @param {object} props - An object that may contain explicit color values for light and dark themes.
 * @param {string} [props.light] - The color to be used in light mode.
 * @param {string} [props.dark] - The color to be used in dark mode.
 * @param {keyof typeof Colors.light & keyof typeof Colors.dark} colorName - The name of the color
 *   to retrieve from the global `Colors` object. This name must exist in both the light and
 *   dark color palettes.
 * @returns {string} The resolved color string for the current theme.
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
