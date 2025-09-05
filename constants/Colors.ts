/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * `tintColorLight` is the primary accent color for the light theme.
 * It is used for elements that need to stand out, such as selected tabs, links, and buttons.
 * @type {string}
 */
const tintColorLight = '#0a7ea4';

/**
 * `tintColorDark` is the primary accent color for the dark theme.
 * It is used for elements that need to stand out in the dark theme.
 * @type {string}
 */
const tintColorDark = '#fff';

/**
 * The `Colors` object contains the color palettes for both the light and dark themes of the application.
 * This centralized color definition allows for easy management and consistency of colors across the app.
 *
 * Each theme (light and dark) has a set of color properties that define the colors for different
 * UI elements, such as text, background, tint, icons, and tab icons.
 *
 * @property {object} light - The color palette for the light theme.
 * @property {string} light.text - The default text color for the light theme.
 * @property {string} light.background - The default background color for the light theme.
 * @property {string} light.tint - The accent color for the light theme.
 * @property {string} light.icon - The default icon color for the light theme.
 * @property {string} light.tabIconDefault - The color for unselected tab icons in the light theme.
 * @property {string} light.tabIconSelected - The color for selected tab icons in the light theme.
 *
 * @property {object} dark - The color palette for the dark theme.
 * @property {string} dark.text - The default text color for the dark theme.
 * @property {string} dark.background - The default background color for the dark theme.
 * @property {string} dark.tint - The accent color for the dark theme.
 * @property {string} dark.icon - The default icon color for the dark theme.
 * @property {string} dark.tabIconDefault - The color for unselected tab icons in the dark theme.
 * @property {string} dark.tabIconSelected - The color for selected tab icons in the dark theme.
 */
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
