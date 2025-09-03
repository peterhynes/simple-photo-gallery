import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { memo, useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

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
});

