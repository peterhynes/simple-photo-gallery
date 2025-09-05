import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

/**
 * `ParallaxScrollView` is a component that creates a parallax scrolling effect for a header image.
 * As the user scrolls down, the header image moves at a different speed than the content,
 * creating a sense of depth and a visually engaging experience.
 *
 * This component is built using `react-native-reanimated` to handle the animations, ensuring
 * that the parallax effect is smooth and performant.
 *
 * Key features of the `ParallaxScrollView` component:
 * - **Parallax Effect:** The header image animates its `translateY` and `scale` properties based
 *   on the scroll offset of the `Animated.ScrollView`. The `interpolate` function is used to
 *   map the scroll position to the desired transform values, creating the parallax effect.
 * - **Customizable Header:** The component accepts a `headerImage` prop, which is a `ReactElement`
 *   to be displayed in the header. This allows for flexible header content. It also takes a
 *   `headerBackgroundColor` prop to set the background color of the header, with support for
 *   light and dark modes.
 * - **Themed Views:** The component uses `ThemedView` for its container and content areas, so it
 *   adapts to the application's color scheme.
 * - **Scroll Handling:** It uses `useAnimatedRef` and `useScrollViewOffset` to get a reference to
 *   the `ScrollView` and track its scroll position, which drives the animation.
 * - **Bottom Tab Overflow:** It incorporates `useBottomTabOverflow` to adjust the scroll indicator
 *   insets and content container padding, preventing the bottom tab bar from obscuring the content.
 *
 * @param {Props} props - The props for the ParallaxScrollView component.
 * @param {React.ReactNode} props.children - The content to be displayed below the parallax header.
 * @param {ReactElement} props.headerImage - The React element to be used as the header image.
 * @param {{ dark: string; light: string }} props.headerBackgroundColor - An object containing the
 *   background colors for the header in dark and light modes.
 * @returns {React.ReactElement} The rendered parallax scroll view component.
 */
export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}>
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}>
          {headerImage}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
