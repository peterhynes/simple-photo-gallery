import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { MediaProvider } from '@/context/MediaContext';

/**
 * `RootLayout` is the main layout component for the entire application. It sets up the navigation
 * stack, loads necessary fonts, and provides a theme based on the user's color scheme.
 *
 * This component performs several key functions:
 * - **Font Loading:** It uses the `useFonts` hook from `expo-font` to load the 'SpaceMono' font.
 *   While the font is loading, it returns `null`, effectively showing a splash screen or a blank
 *   screen until the font is ready.
 * - **Theme Provision:** It wraps the entire application in a `ThemeProvider` from `@react-navigation/native`.
 *   The theme is set to either `DarkTheme` or `DefaultTheme` based on the `colorScheme` obtained
 *   from the `useColorScheme` hook. This ensures that the entire app respects the user's
 *   light or dark mode preference.
 * - **Navigation Stack:** It configures the root `Stack` navigator from `expo-router`. The stack
 *   includes screens for the main tab layout (`(tabs)`), an edit screen, and the "+not-found"
 *   screen for handling unknown routes. The headers for the `(tabs)` and `edit` screens are hidden
 *   to allow for custom header implementations within those screens.
 * - **Status Bar:** It includes the `StatusBar` component from `expo-status-bar`, which automatically
 *   adjusts the status bar style (light or dark) based on the current theme.
 *
 * If the fonts are not yet loaded, the component returns `null`. This is a common pattern for
 * handling asynchronous setup tasks before rendering the main application UI.
 *
 * @returns {React.ReactElement | null} The rendered root layout of the application, or `null` if fonts are not yet loaded.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <MediaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="edit" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </MediaProvider>
    </ThemeProvider>
  );
}
