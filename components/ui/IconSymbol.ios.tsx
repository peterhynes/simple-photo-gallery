import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

/**
 * `IconSymbol` is an iOS-specific component that renders an SF Symbol using the `expo-symbols` library.
 * SF Symbols are a set of over 3,000 symbols provided by Apple that are designed to integrate
 * seamlessly with the San Francisco font. This component provides a convenient way to use these
 * symbols in a React Native application.
 *
 * This component is intended for use on iOS only, as indicated by the `.ios.tsx` file extension.
 * A corresponding `IconSymbol.tsx` should exist for other platforms.
 *
 * Key features of the `IconSymbol` component (iOS):
 * - **SF Symbol Rendering:** It wraps the `SymbolView` component from `expo-symbols` to display
 *   the specified symbol.
 * - **Customization:** It allows for customization of the symbol's `name`, `size`, `color`,
 *   `style`, and `weight`.
 *   - `name`: The name of the SF Symbol to display (e.g., 'house.fill').
 *   - `size`: The size of the symbol's container.
 *   - `color`: The tint color of the symbol.
 *   - `weight`: The weight of the symbol (e.g., 'regular', 'bold').
 *   - `style`: Custom styles to be applied to the `SymbolView`.
 * - **Aspect Ratio:** The `resizeMode` is set to `scaleAspectFit` to ensure that the symbol
 *   maintains its aspect ratio within the specified size.
 *
 * @param {object} props - The props for the IconSymbol component.
 * @param {SymbolViewProps['name']} props.name - The name of the SF Symbol to be displayed.
 * @param {number} [props.size=24] - The size (width and height) of the symbol.
 * @param {string} props.color - The tint color of the symbol.
 * @param {StyleProp<ViewStyle>} [props.style] - Custom styles to be applied to the symbol view.
 * @param {SymbolWeight} [props.weight='regular'] - The weight of the symbol.
 * @returns {React.ReactElement} The rendered SF Symbol component.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
