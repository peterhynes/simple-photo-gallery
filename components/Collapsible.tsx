import { PropsWithChildren, useState, useMemo, memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * `Collapsible` is a memoized React component that provides a collapsible section of content.
 * It consists of a clickable header that toggles the visibility of its children.
 *
 * This component is designed to be a reusable UI element for displaying content that can be
 * shown or hidden by the user, such as in an accordion or a settings menu.
 *
 * Key features of the `Collapsible` component include:
 * - **Toggleable Content:** The main functionality is to show or hide the `children` content
 *   when the header is pressed. The state of the collapsible (open or closed) is managed
 *   internally using the `useState` hook.
 * - **Animated Icon:** A chevron icon is displayed next to the title, which rotates to indicate
 *   the current state (e.g., pointing right when closed and down when open). The rotation is
 *   animated for a smooth user experience.
 * - **Themed Appearance:** The component uses `ThemedView` and `ThemedText` to ensure that its
 *   appearance adapts to the current color scheme (light or dark). The icon color is also
 *   adjusted based on the theme.
 * - **Memoization:** The component is wrapped in `React.memo` to optimize performance by
 *   preventing unnecessary re-renders when its props have not changed.
 *
 * @param {PropsWithChildren & { title: string }} props - The props for the Collapsible component.
 * @param {React.ReactNode} props.children - The content to be displayed inside the collapsible section.
 * @param {string} props.title - The title to be displayed in the header of the collapsible section.
 * @returns {React.ReactElement} The rendered collapsible component.
 */
export const Collapsible = memo(function Collapsible({ 
  children, 
  title 
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  const iconColor = useMemo(() => 
    theme === 'light' ? Colors.light.icon : Colors.dark.icon, 
    [theme]
  );

  const rotateStyle = useMemo(() => ({
    transform: [{ rotate: isOpen ? '90deg' : '0deg' }]
  }), [isOpen]);

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={iconColor}
          style={rotateStyle}
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
