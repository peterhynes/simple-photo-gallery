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

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width / 3;
const PAGE_SIZE = 21; // 3 columns * 7 rows

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

export default function HomeScreen() {
  const router = useRouter();
  const [media, setMedia] = useState<MediaLibrary.Asset[]>([]);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  async function loadMedia() {
    if (permissionResponse?.granted) {
      setIsLoading(true);
      setError(null);
      try {
        const {
          assets,
          endCursor: newEndCursor,
          hasNextPage: newHasNextPage,
        } = await MediaLibrary.getAssetsAsync({
          mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
          sortBy: ['creationTime'],
          first: PAGE_SIZE,
        });
        setMedia(assets);
        setEndCursor(newEndCursor);
        setHasNextPage(newHasNextPage);
      } catch (e) {
        setError('Failed to load media. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }

  async function loadMoreMedia() {
    if (!hasNextPage || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const {
        assets,
        endCursor: newEndCursor,
        hasNextPage: newHasNextPage,
      } = await MediaLibrary.getAssetsAsync({
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: ['creationTime'],
        first: PAGE_SIZE,
        after: endCursor,
      });

      setMedia((prevMedia) => [...prevMedia, ...assets]);
      setEndCursor(newEndCursor);
      setHasNextPage(newHasNextPage);
    } catch (e) {
      console.error('Failed to load more media', e);
      // Optionally, you could set an error state here to show a toast or a small error indicator
    } finally {
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    if (permissionResponse?.granted) {
      loadMedia();
    }
  }, [permissionResponse?.granted]);

  const renderItem = useCallback(
    ({ item, index }: { item: MediaLibrary.Asset; index: number }) => (
      <MediaItem
        item={item}
        onPress={() =>
          router.push({
            pathname: '/media',
            params: { assets: JSON.stringify(media), index },
          })
        }
      />
    ),
    [media, router]
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

  return (
    <FlatList
      data={media}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={3}
      onEndReached={loadMoreMedia}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isLoadingMore ? <ActivityIndicator style={styles.footer} /> : null}
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
  },
  playIcon: {
    position: 'absolute',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});
