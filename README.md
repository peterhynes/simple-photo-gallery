# Simple Photo Gallery

This is a simple photo gallery application built with Expo. It allows users to browse their photo and video library, view media in full-screen, and perform basic image editing tasks such as cropping, rotating, and zooming.

The application is designed to be a showcase of modern React Native development practices, including:

- **File-based routing** with `expo-router`.
- **Theme support** for light and dark modes.
- **Cross-platform compatibility** for iOS, Android, and web.
- **Performant media handling** with `expo-image` and `expo-video`.
- **Gesture-based interactions** using `react-native-gesture-handler` and `react-native-reanimated`.
- **Native-like UI elements**, such as SF Symbols on iOS and blurred backgrounds.

## Features

- **Media Grid:** Displays a grid of photos and videos from the user's media library.
- **Infinite Scrolling:** Loads more media as the user scrolls down.
- **Full-Screen Viewer:** Allows users to view photos and videos in full-screen with horizontal swiping.
- **Video Playback:** Plays videos directly in the full-screen viewer.
- **Image Editor:** Provides tools to crop, rotate, and zoom photos.
- **Themed Interface:** Adapts to the user's system-wide light or dark mode settings.

## Get Started

To run this project locally, follow these steps:

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Start the development server:**

    ```bash
    npx expo start
    ```

    This will open the Expo DevTools in your browser. From there, you can:
    -   Run the app on an **iOS simulator** (macOS only).
    -   Run the app on an **Android emulator**.
    -   Run the app on a physical device using the **Expo Go** app.
    -   Run the app in a **web browser**.

## Project Structure

The main source code for the application is organized into the following directories:

-   `app/`: Contains all the screens and navigation logic, using file-based routing.
    -   `(tabs)/`: Defines the layout and screens for the bottom tab navigator.
    -   `edit.tsx`: The image editing screen.
    -   `media.tsx`: The full-screen media viewer.
-   `components/`: Includes reusable UI components used throughout the application.
    -   `ui/`: Contains low-level UI elements like icons and themed views.
-   `constants/`: Stores constant values, such as color palettes for themes.
-   `hooks/`: Holds custom React hooks, such as `useThemeColor` for theme-aware components.
-   `assets/`: Contains static assets like images and fonts.

## Key Technologies

This project is built with a variety of modern technologies, including:

-   [Expo](https://expo.dev/): The framework for building the application.
-   [React Native](https://reactnative.dev/): The core library for building native UIs with React.
-   [Expo Router](https://docs.expo.dev/router/introduction/): For file-based navigation.
-   [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/): For high-performance image rendering.
-   [Expo Video](https://docs.expo.dev/versions/latest/sdk/video/): For video playback.
-   [Expo MediaLibrary](https://docs.expo.dev/versions/latest/sdk/media-library/): To access the user's photo and video library.
-   [Expo Image Manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/): For image editing functionalities.
-   [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/): For creating smooth animations.
-   [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/): For handling complex gestures.
-   [TypeScript](https://www.typescriptlang.org/): For type-safe JavaScript development.

## Learn More

To learn more about the technologies used in this project, refer to the following resources:

-   [Expo Documentation](https://docs.expo.dev/): The official documentation for the Expo framework.
-   [React Native Documentation](https://reactnative.dev/docs/getting-started): The official documentation for React Native.
-   [Expo Router Documentation](https://docs.expo.dev/router/introduction/): Learn more about file-based routing with Expo.

## Join the Community

-   [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
-   [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
