/**
 * This file serves as a shim for the `TabBarBackground` component on non-iOS platforms (Android and web).
 * On these platforms, the tab bar is typically opaque, and a special background component like the
 * blurred view on iOS is not needed.
 *
 * By exporting `undefined`, this module effectively provides no background component, allowing the
 * default tab bar background to be used. This is a common pattern in React Native for handling
 * platform-specific components.
 *
 * @default undefined
 */
export default undefined;

/**
 * `useBottomTabOverflow` is a hook that provides a fallback value for the bottom tab bar height
 * on non-iOS platforms. On Android and web, the tab bar is usually opaque, and content does not
 * scroll underneath it. Therefore, there is no "overflow" to account for.
 *
 * This hook returns `0`, indicating that no extra padding or inset is needed for the content
 * to avoid being obscured by the tab bar. This provides a consistent API with the iOS-specific
 * version of the hook, which returns the actual tab bar height.
 *
 * @returns {number} `0` - indicating no overflow.
 */
export function useBottomTabOverflow() {
  return 0;
}
