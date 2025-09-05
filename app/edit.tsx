import { useLocalSearchParams, useRouter } from 'expo-router';
import { Dimensions, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Canvas, useImage, Image as SkiaImage } from '@shopify/react-native-skia';

import { ThemedText } from '@/components/ThemedText';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function EditScreen() {
  const params = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const image = useImage(params.imageUri);

  if (!params.imageUri || !image) {
    return (
      <View style={styles.container}>
        <ThemedText>No image selected</ThemedText>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Canvas style={styles.canvas}>
        <SkiaImage
          image={image}
          fit="contain"
          x={0}
          y={0}
          width={screenWidth}
          height={screenHeight}
        />
      </Canvas>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    flex: 1,
    width: '100%',
  },
});
