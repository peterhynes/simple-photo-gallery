import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Button,
    Dimensions,
    FlatList,
    Linking,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useMedia } from '@/context/MediaContext';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width / 3;
const PAGE_SIZE = 21; // 3 columns * 7 rows

/**
 * `MediaItem` is a memoized component that renders a single photo or video from the user's media library.
 * It displays a thumbnail of the media and, if it's a video, overlays a play icon.
 * The component is designed to be performant within a `FlatList` by using `React.memo` to prevent
 * unnecessary re-renders.
 *
 * When pressed, the component provides visual feedback by reducing its opacity and triggers the `onPress`
 * callback, which is used to navigate to a detailed view of the media.
 *
 * @param {object} props - The props for the MediaItem component.
 * @param {MediaLibrary.Asset} props.item - The media asset to be displayed. This object contains
 *   information about the media, such as its URI and media type.
 * @param {() => void} props.onPress - A callback function that is executed when the media item is pressed.
 * @returns {React.ReactElement} The rendered media item component.
 */
const MediaItem = memo(
  ({
    item,
    onPress,
  }: {
    item: MediaLibrary.Asset;
    onPress: () => void;
  }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.imageContainer,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={onPress}>
        <Image
          source={{ uri: item.uri }}
          style={styles.image}
          contentFit="cover"
          placeholder={{ thumbhash: 'L0A84nI400000000000000000000' }}
          transition={300}
        />
        {item.mediaType === MediaLibrary.MediaType.video && (
          <Ionicons
            name="play"
            size={32}
            color="white"
            style={styles.playIcon}
            // @ts-ignore
            stroke="black"
            strokeWidth={8}
          />
        )}
      </Pressable>
    );
  }
);

MediaItem.displayName = 'MediaItem';

/**
 * The `HomeScreen` component is the main screen of the application, responsible for displaying a grid
 * of photos and videos from the user's media library. It handles permissions, loading states,
 * and infinite scrolling.
 *
 * Key functionalities of this component include:
 * - **Permissions Handling:** It uses `MediaLibrary.usePermissions` to request and manage access
 *   to the user's photo gallery. It provides clear user feedback and actions based on the
 *   permission status (e.g., loading indicators, permission requests, or a link to settings).
 * - **Media Loading:** It fetches media assets from the `MediaLibrary` in pages to optimize
 *   performance. The `loadMedia` function loads the initial set of media, and `loadMoreMedia`
 *   is used for infinite scrolling.
 * - **State Management:** The component manages several state variables, including the list of
 *   media, loading indicators (`isLoading`, `isLoadingMore`), pagination state (`hasNextPage`,
 *   `endCursor`), and error states.
 * - **Rendering:** It uses a `FlatList` to efficiently render the grid of media items. The `MediaItem`
 *   component is used for each item in the grid.
 * - **Navigation:** When a media item is pressed, it navigates to the `/media` route, passing the
 *   list of assets and the selected index as parameters.
 *
 * The component provides a robust and user-friendly experience for browsing a media gallery,
 * with proper handling of loading, permissions, and error states.
 *
 * @returns {React.ReactElement} The rendered home screen component.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { assets, setAssets, addAssets } = useMedia();
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const loadMedia = useCallback(async () => {
    if (permissionResponse?.granted) {
      setIsLoading(true);
      setError(null);
      setLoadMoreError(null);
      try {
        const {
          assets: newAssets,
          endCursor: newEndCursor,
          hasNextPage: newHasNextPage,
        } = await MediaLibrary.getAssetsAsync({
          mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
          sortBy: ['creationTime'],
          first: PAGE_SIZE,
        });
        setAssets(newAssets);
        setEndCursor(newEndCursor);
        setHasNextPage(newHasNextPage);
      } catch {
        setError('Failed to load media. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [permissionResponse?.granted, setAssets]);

  async function loadMoreMedia() {
    if (!hasNextPage || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const {
        assets: newAssets,
        endCursor: newEndCursor,
        hasNextPage: newHasNextPage,
      } = await MediaLibrary.getAssetsAsync({
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: ['creationTime'],
        first: PAGE_SIZE,
        after: endCursor,
      });

      addAssets(newAssets);
      setEndCursor(newEndCursor);
      setHasNextPage(newHasNextPage);
    } catch (e) {
      console.error('Failed to load more media', e);
      setLoadMoreError('Failed to load more media. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    // Only load media if the context is empty
    if (permissionResponse?.granted && assets.length === 0) {
      loadMedia();
    }
  }, [permissionResponse?.granted, assets.length, loadMedia]);

  const renderItem = useCallback(
    ({ item, index }: { item: MediaLibrary.Asset; index: number }) => (
      <MediaItem
        item={item}
        onPress={() =>
          router.push({
            pathname: '/media',
            params: { index: index.toString() },
          })
        }
      />
    ),
    [router]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permissionResponse) {
    // Permissions are still loading
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.permissionText}>{error}</ThemedText>
        <Button title="Try Again" onPress={loadMedia} />
      </View>
    );
  }

  const { granted, canAskAgain } = permissionResponse;

  if (!granted) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.permissionText}>
          This app needs access to your photo gallery to display your photos and videos.
        </ThemedText>
        {canAskAgain ? (
          <Button title="Grant Permission" onPress={requestPermission} />
        ) : (
          <Button title="Open Settings" onPress={() => Linking.openSettings()} />
        )}
      </View>
    );
  }

  const renderFooter = () => {
    if (isLoadingMore) {
      return <ActivityIndicator style={styles.footer} />;
    }
    if (loadMoreError) {
      return (
        <View style={styles.footer}>
          <ThemedText style={styles.errorText}>{loadMoreError}</ThemedText>
          <Button title="Try Again" onPress={loadMoreMedia} />
        </View>
      );
    }
    return null;
  };

  return (
    <FlatList
      data={assets}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={3}
      onEndReached={loadMoreMedia}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  footer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  playIcon: {
    position: 'absolute',
    textShadow: '0px 0px 5px rgba(0, 0, 0, 0.75)',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 10,
    color: 'red',
  },
});
