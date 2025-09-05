import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Grayscale,
  Sepia,
  Vintage,
  Warm,
  Cool,
  Brightness,
  Contrast,
  normal,
  grayscale,
  sepia,
  vintage,
  warm,
  cool,
  brightness,
  contrast,
} from 'react-native-color-matrix-image-filters';

import { ThemedText } from '@/components/ThemedText';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CROP_AREA_SIZE = screenWidth - 40;

/**
 * `EditScreen` is a comprehensive image editing component that allows users to perform basic
 * transformations on an image, such as panning, pinching (zooming), and rotating.
 * The screen is designed to provide a rich, interactive experience for editing photos.
 *
 * Key features of this screen include:
 * - **Gesture Handling:** It uses `react-native-gesture-handler` to manage pan and pinch gestures.
 *   - `PinchGestureHandler` allows users to zoom in and out of the image.
 *   - `PanGestureHandler` enables users to move the image within the crop area.
 * - **Animations:** The component leverages `react-native-reanimated` to create smooth animations
 *   for scaling, translation, and rotation of the image. `useSharedValue` and `useAnimatedStyle`
 *   are used to manage the animated properties.
 * - **Image Manipulation:** It utilizes `expo-image-manipulator` to apply the transformations
 *   (rotation and cropping) to the image when the user saves their changes.
 * - **UI Controls:** The screen provides a set of UI controls for:
 *   - **Saving:** Applies the edits and saves the new image to the media library.
 *   - **Canceling:** Discards the changes and navigates back to the previous screen.
 *   - **Rotating:** Rotates the image by 90-degree increments.
 *   - **Resetting:** Resets all transformations to their initial state.
 * - **Crop Overlay:** A visual crop area with a grid is displayed to guide the user's edits.
 *   The final image is cropped to this area.
 * - **State Management:** The component manages the state of the editing process, including
 *   whether the image is currently being processed, the rotation angle, and the gesture-driven
 *   transformations.
 *
 * The `useLocalSearchParams` hook is used to receive the URI of the image to be edited from the
 * navigation parameters. After saving, the user is alerted of the success and navigated back.
 *
 * @returns {React.ReactElement} The rendered image editing screen.
 */
export default function EditScreen() {
  const params = useLocalSearchParams<{ imageUri: string; returnIndex: string }>();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('original');
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = [
    { id: 'original', name: 'Original', component: null, matrix: normal() },
    { id: 'grayscale', name: 'B&W', component: Grayscale, matrix: grayscale() },
    { id: 'sepia', name: 'Sepia', component: Sepia, matrix: sepia() },
    { id: 'vintage', name: 'Vintage', component: Vintage, matrix: vintage() },
    { id: 'warm', name: 'Warm', component: Warm, matrix: warm() },
    { id: 'cool', name: 'Cool', component: Cool, matrix: cool() },
    { id: 'bright', name: 'Bright', component: Brightness, matrix: brightness(1.2) },
    { id: 'contrast', name: 'Contrast', component: Contrast, matrix: contrast(1.2) },
  ];

  const currentFilter = filterOptions.find(f => f.id === selectedFilter);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const FilterThumbnail = useCallback(({ filter, isSelected, onPress }: { 
    filter: typeof filterOptions[0], 
    isSelected: boolean, 
    onPress: () => void 
  }) => {
    const FilterComponent = filter.component;
    const thumbnailImage = (
      <Image
        source={{ uri: params.imageUri }}
        style={styles.filterThumbnail}
        contentFit="cover"
      />
    );

    return (
      <Pressable
        style={[styles.filterOption, isSelected && styles.filterOptionSelected]}
        onPress={onPress}
      >
        {FilterComponent ? (
          <FilterComponent>{thumbnailImage}</FilterComponent>
        ) : (
          thumbnailImage
        )}
        <ThemedText style={styles.filterName}>{filter.name}</ThemedText>
      </Pressable>
    );
  }, [params.imageUri]);

  const pinchHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startScale = scale.value;
    },
    onActive: (event: any, context: any) => {
      scale.value = Math.max(0.5, Math.min(3, context.startScale * event.scale));
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      }
    },
  });

  const panHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event: any, context: any) => {
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    setSelectedFilter('original');
    setRotation(0);
  }, [scale, translateX, translateY]);

  const handleSave = useCallback(async () => {
    if (!params.imageUri) return;

    setIsProcessing(true);
    try {
      let imageUri = params.imageUri;
      
      if (selectedFilter !== 'original' && currentFilter?.matrix) {
        const filterResult = await ImageManipulator.manipulateAsync(
          imageUri,
          [],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );
        imageUri = filterResult.uri;
      }

      const imageSize = CROP_AREA_SIZE * 2;
      const currentScale = scale.value;
      const currentTranslateX = translateX.value;
      const currentTranslateY = translateY.value;

      const cropData = {
        originX: Math.max(0, (imageSize - CROP_AREA_SIZE) / 2 - currentTranslateX / currentScale),
        originY: Math.max(0, (imageSize - CROP_AREA_SIZE) / 2 - currentTranslateY / currentScale),
        width: Math.min(imageSize, CROP_AREA_SIZE / currentScale),
        height: Math.min(imageSize, CROP_AREA_SIZE / currentScale),
      };

      const manipulations = [];
      if (rotation !== 0) {
        manipulations.push({ rotate: rotation });
      }
      manipulations.push({ crop: cropData });

      let manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        manipulations,
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      await MediaLibrary.createAssetAsync(manipulatedImage.uri);
      
      Alert.alert('Success', 'Image saved to gallery!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [params.imageUri, selectedFilter, currentFilter, rotation, scale.value, translateX.value, translateY.value, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  if (!params.imageUri) {
    return (
      <View style={styles.container}>
        <ThemedText>No image selected</ThemedText>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleCancel}>
          <Ionicons name="close" size={24} color="white" />
          <ThemedText style={styles.headerButtonText}>Cancel</ThemedText>
        </Pressable>
        <ThemedText style={styles.title}>Edit Photo</ThemedText>
        <Pressable
          style={[styles.headerButton, isProcessing && styles.disabledButton]}
          onPress={handleSave}
          disabled={isProcessing}>
          {isProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark" size={24} color="white" />
              <ThemedText style={styles.headerButtonText}>Save</ThemedText>
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.imageContainer}>
        <View style={styles.cropOverlay}>
          <View style={styles.cropArea}>
            <View style={styles.cropGrid}>
              <View style={[styles.gridLine, styles.gridLineVertical, { left: '33.33%' }]} />
              <View style={[styles.gridLine, styles.gridLineVertical, { left: '66.66%' }]} />
              <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '33.33%' }]} />
              <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '66.66%' }]} />
            </View>
            <PinchGestureHandler onGestureEvent={pinchHandler}>
              <Animated.View style={styles.gestureContainer}>
                <PanGestureHandler onGestureEvent={panHandler}>
                  <Animated.View style={[styles.imageWrapper, animatedStyle]}>
                    {currentFilter?.component ? (
                      <currentFilter.component>
                        <Image
                          source={{ uri: params.imageUri }}
                          style={styles.image}
                          contentFit="contain"
                        />
                      </currentFilter.component>
                    ) : (
                      <Image
                        source={{ uri: params.imageUri }}
                        style={styles.image}
                        contentFit="contain"
                      />
                    )}
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
            </PinchGestureHandler>
          </View>
        </View>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <FlatList
            data={filterOptions}
            renderItem={({ item }) => (
              <FilterThumbnail
                filter={item}
                isSelected={selectedFilter === item.id}
                onPress={() => setSelectedFilter(item.id)}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          />
        </View>
      )}

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="color-filter" size={24} color="white" />
          <ThemedText style={styles.controlButtonText}>Filters</ThemedText>
        </Pressable>
        <Pressable style={styles.controlButton} onPress={handleRotate}>
          <Ionicons name="refresh" size={24} color="white" />
          <ThemedText style={styles.controlButtonText}>Rotate</ThemedText>
        </Pressable>
        <Pressable style={styles.controlButton} onPress={handleReset}>
          <Ionicons name="refresh-outline" size={24} color="white" />
          <ThemedText style={styles.controlButtonText}>Reset</ThemedText>
        </Pressable>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropOverlay: {
    width: screenWidth,
    height: screenHeight - 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropArea: {
    width: CROP_AREA_SIZE,
    height: CROP_AREA_SIZE,
    borderWidth: 2,
    borderColor: 'white',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  gestureContainer: {
    flex: 1,
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: CROP_AREA_SIZE * 2,
    height: CROP_AREA_SIZE * 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cropGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gridLineVertical: {
    width: 1,
    height: '100%',
  },
  gridLineHorizontal: {
    height: 1,
    width: '100%',
  },
  filtersContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  filtersScrollContent: {
    paddingHorizontal: 10,
  },
  filterOption: {
    alignItems: 'center',
    marginHorizontal: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'white',
  },
  filterThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
  },
  filterName: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});
