import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

/**
 * `HapticTab` is a custom tab bar button component that adds haptic feedback on press.
 * It is designed to be used as the `tabBarButton` in a React Navigation bottom tab navigator,
 * enhancing the user experience by providing physical feedback when a tab is pressed.
 *
 * This component wraps the `PlatformPressable` from `@react-navigation/elements`, ensuring
 * that the button has the correct platform-specific press behavior (e.g., ripple effect
 * on Android and opacity change on iOS).
 *
 * The key feature of `HapticTab` is its `onPressIn` event handler. On iOS, this handler
 * triggers a light haptic feedback using `Haptics.impactAsync` from `expo-haptics`. This
 * provides a subtle, satisfying tactile response when the user touches a tab. The original
 * `onPressIn` prop, if provided, is also called.
 *
 * The component accepts all the props of a standard `BottomTabBarButtonProps`, making it a
 * seamless replacement for the default tab bar button.
 *
 * @param {BottomTabBarButtonProps} props - The props for the HapticTab component, which are
 *   passed down from the tab navigator.
 * @returns {React.ReactElement} The rendered pressable tab component with haptic feedback.
 */
export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
