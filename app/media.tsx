import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Pressable, StyleSheet } from 'react-native';

export default function FullScreenMediaScreen() {
  const { uri, mediaType } = useLocalSearchParams<{ uri: string; mediaType: string }>();
  const router = useRouter();
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.play();
  });

  return (
    <Pressable style={styles.container} onPress={() => router.back()}>
      {mediaType === 'photo' ? (
        <Image source={{ uri }} style={styles.media} contentFit="contain" transition={300} />
      ) : (
        <VideoView player={player} style={styles.media} nativeControls contentFit="contain" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
  },
});
