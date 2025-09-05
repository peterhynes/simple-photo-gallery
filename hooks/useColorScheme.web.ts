import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
/**
 * `useColorScheme` is a web-specific implementation of the hook that determines the user's
 * color scheme. This version is designed to handle the complexities of server-side rendering (SSR)
 * and client-side hydration on the web.
 *
 * The standard `useColorScheme` from `react-native` might not work correctly during the initial
 * server render because the server has no information about the user's browser or system preferences.
 * This can lead to a mismatch between the server-rendered HTML and the client-rendered content,
 * causing hydration errors.
 *
 * This hook addresses the issue by:
 * 1. **Defaulting to 'light' on the server:** During the initial render (before hydration),
 *    it returns a default value of 'light'. This ensures that the server-rendered content is
 *    consistent.
 * 2. **Detecting Hydration:** It uses a `useState` and `useEffect` pair to track whether the
 *    component has "hydrated" (i.e., mounted and rendered on the client side).
 * 3. **Using the Real Color Scheme on the Client:** Once the component has hydrated, the hook
 *    switches to using the actual color scheme value from `react-native`'s `useColorScheme`.
 *
 * This approach ensures a smooth and error-free rendering experience for web users, while still
 * respecting their color scheme preference after the initial page load.
 *
 * @returns {'light' | 'dark' | null | undefined} The user's current color scheme preference.
 *   Returns 'light' during server-side rendering and before client-side hydration.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
