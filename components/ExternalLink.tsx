import { Href, Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

/**
 * `ExternalLink` is a specialized `Link` component designed to handle external URLs gracefully
 * across different platforms (web, iOS, and Android).
 *
 * This component wraps the `Link` component from `expo-router` and modifies its behavior to provide
 * a better user experience for opening external links.
 *
 * Key functionalities include:
 * - **Platform-Specific Behavior:**
 *   - **On the web:** It behaves like a standard anchor tag (`<a target="_blank">`), opening the
 *     link in a new tab.
 *   - **On native platforms (iOS and Android):** It prevents the default behavior of opening the
 *     link in the device's default browser. Instead, it uses `expo-web-browser`'s `openBrowserAsync`
 *     method to open the link in an in-app browser. This provides a more seamless experience for
 *     the user, as they don't have to leave the application to view the external content.
 * - **Props Forwarding:** It accepts all the props of the `expo-router` `Link` component (except for
 *   `href`, which is explicitly handled) and forwards them. This allows for customization of the
 *   link's appearance and behavior, such as styling.
 *
 * The component is defined with a `Props` type that ensures the `href` prop is a string, providing
 * type safety.
 *
 * @param {Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string }} props - The props for the ExternalLink component.
 * @param {Href<string>} props.href - The URL to which the link should navigate.
 * @param {object} props.rest - Any other props to be passed to the underlying `Link` component.
 * @returns {React.ReactElement} The rendered external link component.
 */
export function ExternalLink({
  href,
  ...rest
}: Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string }) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href);
        }
      }}
    />
  );
}
