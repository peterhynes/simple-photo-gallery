import { useEffect, memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';

/**
 * `HelloWave` is a memoized component that displays a waving hand emoji with an animation.
 * It is designed to be a playful and welcoming element in the UI.
 *
 * The component uses `react-native-reanimated` to create a rotation animation that makes the
 * hand emoji "wave". The animation is triggered when the component mounts.
 *
 * Key features of the `HelloWave` component:
 * - **Waving Animation:** It uses `useSharedValue` to create a shared value for the rotation.
 *   The `useEffect` hook starts a sequence of animations:
 *   - The hand rotates to 25 degrees.
 *   - It then rotates back to 0 degrees.
 *   - This sequence is repeated 4 times using `withRepeat` and `withSequence`.
 *   - `withTiming` is used to control the duration of each part of the animation.
 * - **Animated Style:** `useAnimatedStyle` creates a style object that applies the rotation
 *   transform to the `Animated.View`.
 * - **Themed Text:** The waving hand emoji is rendered inside a `ThemedText` component, although
 *   in this case, it's an emoji and not text that will change with the theme.
 * - **Memoization:** The component is wrapped in `React.memo` to prevent unnecessary re-renders,
 *   which is a good practice for components with animations that don't depend on external props.
 *
 * @returns {React.ReactElement} The rendered animated waving hand component.
 */
export const HelloWave = memo(function HelloWave() {
  const rotationAnimation = useSharedValue(0);

  useEffect(() => {
    rotationAnimation.value = withRepeat(
      withSequence(withTiming(25, { duration: 150 }), withTiming(0, { duration: 150 })),
      4 // Run the animation 4 times
    );
  }, [rotationAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
