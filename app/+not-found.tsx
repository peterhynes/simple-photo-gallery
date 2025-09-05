import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

/**
 * `NotFoundScreen` is a React component that is displayed when a route is not found in the application.
 * It provides a user-friendly message indicating that the requested screen does not exist and includes a
 * link to navigate back to the home screen.
 *
 * This component utilizes a `Stack.Screen` to set the title of the screen to "Oops!". The main content
 * is wrapped in a `ThemedView`, which ensures the background color adapts to the current theme.
 *
 * The screen displays a title "This screen does not exist." and a `Link` component from `expo-router`
 * that allows the user to return to the home screen. The text and link are styled using `ThemedText`
 * to match the application's theme.
 *
 * @returns {React.ReactElement} The rendered "Not Found" screen component.
 */
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">This screen does not exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
