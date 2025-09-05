import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { memo, useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

/**
 * `VideoPlayer` is a memoized component that handles the playback of a single video.
 * It uses the `useVideoPlayer` hook from `expo-video` to create and manage a video player instance.
 *
 * The component is designed to be used within a `FlatList` and will automatically play the video
 * when it becomes visible and pause it when it is no longer visible. This is controlled by the
 * `isVisible` prop.
 *
 * The `VideoView` component is used to render the video, with native controls enabled to allow
 * the user to interact with the video playback (e.g., play, pause, seek).
 *
 * @param {object} props - The props for the VideoPlayer component.
 * @param {string} props.uri - The URI of the video to be played.
 * @param {boolean} props.isVisible - A boolean indicating whether the video is currently visible
 *   on the screen. This determines whether the video should play or be paused.
 * @returns {React.ReactElement} The rendered video player component.
 */
const VideoPlayer = memo(({ uri, isVisible }: { uri: string; isVisible: boolean }) => {
  const player = useVideoPlayer(uri);

  useEffect(() => {
    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible, player]);

  return <VideoView player={player} style={styles.media} contentFit="contain" nativeControls />;
});

VideoPlayer.displayName = 'VideoPlayer';

/**
 * `FullScreenMediaScreen` is a component that displays a full-screen view of photos and videos.
 * It allows users to swipe horizontally through a collection of media assets.
 *
 * Key functionalities of this component include:
 * - **Data Handling:** It receives a list of media assets and the initial index to display from
 *   the navigation parameters using `useLocalSearchParams`. The assets are expected to be a
 *   JSON string, which is parsed into an array of `MediaLibrary.Asset` objects.
 * - **Horizontal Swiping:** It uses a horizontal `FlatList` to render the media items. This
 *   setup allows for efficient and smooth swiping between photos and videos.
 * - **Video Playback:** For video assets, it renders the `VideoPlayer` component. The `onViewableItemsChanged`
 *   callback is used to determine which video is currently visible and should be playing.
 * - **Image Display:** For photo assets, it uses the `Image` component from `expo-image` to display
 *   the image.
 * - **Navigation:**
 *   - Pressing on the media item (photo or video) navigates the user back to the previous screen.
 *   - For photos, an edit button is displayed, which navigates to the `/edit` screen, passing the
 *     image URI for editing.
 * - **Performance Optimization:**
 *   - `getItemLayout` is used to optimize the `FlatList` performance by providing the layout
 *     information for each item, which avoids dynamic measurement.
 *   - The `VideoPlayer` component is memoized to prevent unnecessary re-renders.
 *
 * This component provides an immersive experience for viewing media, with a focus on performance
 * and user-friendly navigation.
 *
 * @returns {React.ReactElement | null} The rendered full-screen media viewer, or `null` if no assets are provided.
 */
export default function FullScreenMediaScreen() {
  const params = useLocalSearchParams<{ assets: string; index: string }>();
  const router = useRouter();

  const assets: MediaLibrary.Asset[] = params.assets ? JSON.parse(params.assets) : [];
  const initialIndex = params.index ? parseInt(params.index, 10) : 0;

  const [visibleIndex, setVisibleIndex] = useState(initialIndex);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  if (!assets.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={assets}
        renderItem={({ item, index }) => (
          <View style={styles.page}>
            <Pressable onPress={() => router.back()} style={styles.pressable}>
              {item.mediaType === 'photo' ? (
                <Image source={{ uri: item.uri }} style={styles.media} contentFit="contain" />
              ) : (
                <VideoPlayer uri={item.uri} isVisible={index === visibleIndex} />
              )}
            </Pressable>
            {item.mediaType === 'photo' && (
              <Pressable
                style={styles.editButton}
                onPress={() =>
                  router.push({
                    pathname: '/edit',
                    params: { imageUri: item.uri, returnIndex: index.toString() },
                  })
                }>
                <Ionicons name="create-outline" size={24} color="white" />
              </Pressable>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        initialScrollIndex={initialIndex}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  pressable: {
    flex: 1,
    width: '100%',
  },
  editButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

