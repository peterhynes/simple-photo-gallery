// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps, memo } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
/**
 * `IconSymbol` is a cross-platform icon component that serves as a fallback for non-iOS platforms
 * (Android and web). It uses Material Icons as a substitute for SF Symbols, which are only
 * available on iOS.
 *
 * This component ensures that the application can use a consistent set of icon names (based on
 * SF Symbols) across all platforms, while rendering the appropriate icon set for the current
 * platform.
 *
 * Key features of the `IconSymbol` component (non-iOS):
 * - **Platform Fallback:** It provides a fallback implementation for the `IconSymbol.ios.tsx`
 *   component. When the app is running on Android or web, this component will be used instead.
 * - **Icon Mapping:** It uses a `MAPPING` object to translate SF Symbol names to their closest
 *   Material Icons equivalent. This mapping needs to be manually maintained by the developer.
 * - **Material Icons Rendering:** It uses the `MaterialIcons` component from `@expo/vector-icons`
 *   to render the icons.
 * - **Customization:** It allows for customization of the icon's `name`, `size`, `color`, and
 *   `style`, similar to its iOS counterpart.
 * - **Memoization:** The component is wrapped in `React.memo` to optimize performance by
 *   preventing unnecessary re-renders.
 *
 * @param {object} props - The props for the IconSymbol component.
 * @param {IconSymbolName} props.name - The name of the icon, based on SF Symbol names. This name
 *   is used as a key in the `MAPPING` object to find the corresponding Material Icons name.
 * @param {number} [props.size=24] - The size of the icon.
 * @param {string | OpaqueColorValue} props.color - The color of the icon.
 * @param {StyleProp<TextStyle>} [props.style] - Custom styles to be applied to the icon.
 * @param {SymbolWeight} [props.weight] - The weight of the symbol (note: this prop is ignored
 *   for Material Icons but is included for API consistency with the iOS version).
 * @returns {React.ReactElement} The rendered Material Icons component.
 */
export const IconSymbol = memo(function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
});
