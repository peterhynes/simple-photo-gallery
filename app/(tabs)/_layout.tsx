import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * TabLayout is a React component that defines the layout for the tab-based navigation in the app.
 * It uses the `Tabs` component from `expo-router` to create two tabs: "Home" and "Explore".
 *
 * The component customizes the appearance and behavior of the tab bar, including:
 * - Setting the active tab tint color based on the current color scheme.
 * - Hiding the header for all screens within the tabs.
 * - Using a custom `HapticTab` component for the tab bar buttons to provide haptic feedback.
 * - Applying a `TabBarBackground` component for a custom tab bar appearance.
 * - Adjusting the tab bar style for iOS to create a floating/translucent effect.
 *
 * Each tab is configured with a title and an icon, which is rendered using the `IconSymbol` component.
 * The `colorScheme` hook is used to adapt the UI to the user's preferred theme (light or dark).
 *
 * @returns {React.ReactElement} The rendered tab layout component.
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
