import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { useMedia } from '@/context/MediaContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CROP_AREA_SIZE = screenWidth - 40;

/**
 * The context for the pinch gesture handler.
 * Used to store the starting scale of the image when the pinch gesture begins.
 */
type PinchContext = {
  startScale: number;
};

/**
 * The context for the pan gesture handler.
 * Used to store the starting translation values of the image when the pan gesture begins.
 */
type PanContext = {
  startX: number;
  startY: number;
};

type EditMode = 'view' | 'crop';

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
  const { prependAsset } = useMedia();
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number } | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('view');

  // Active transform values (shared values for reanimated)
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  // Committed transform values
  const committedScale = useSharedValue(1);
  const committedTranslateX = useSharedValue(0);
  const committedTranslateY = useSharedValue(0);
  const committedRotation = useSharedValue(0);

  useEffect(() => {
    if (params.imageUri) {
      Image.getSize(params.imageUri, (width, height) => {
        setOriginalImageSize({ width, height });
      });
    }
  }, [params.imageUri]);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinchHandler = useAnimatedGestureHandler<
    PinchGestureHandlerGestureEvent,
    PinchContext
  >({
    onStart: (_, context) => {
      context.startScale = scale.value;
    },
    onActive: (event, context) => {
      scale.value = Math.max(0.5, Math.min(3, context.startScale * event.scale));
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      }
    },
  });

  const panHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    PanContext
  >({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
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

  const handleRotate = useCallback(() => {
    rotation.value = withSpring((rotation.value + 90) % 360);
  }, [rotation]);

  const handleReset = useCallback(() => {
    scale.value = withSpring(committedScale.value);
    translateX.value = withSpring(committedTranslateX.value);
    translateY.value = withSpring(committedTranslateY.value);
    rotation.value = withSpring(committedRotation.value);
  }, [scale, translateX, translateY, rotation, committedScale, committedTranslateX, committedTranslateY, committedRotation]);

  const handleEnterCropMode = () => {
    setEditMode('crop');
  };

  const handleCancelCrop = () => {
    // Reset to last committed values
    scale.value = withSpring(committedScale.value);
    translateX.value = withSpring(committedTranslateX.value);
    translateY.value = withSpring(committedTranslateY.value);
    rotation.value = withSpring(committedRotation.value);
    setEditMode('view');
  };

  const handleDoneCrop = () => {
    // Commit the current values
    committedScale.value = scale.value;
    committedTranslateX.value = translateX.value;
    committedTranslateY.value = translateY.value;
    committedRotation.value = rotation.value;
    setEditMode('view');
  };

  const handleSave = useCallback(async () => {
    if (!params.imageUri || !originalImageSize) return;

    setIsProcessing(true);
    try {
      // TODO: This calculation is still not perfect and could be improved.
      // It assumes the image is scaled to fit the crop area width, which might not be the case for tall images.
      // A more robust solution would involve calculating the scale factor based on the actual image and crop area dimensions.
      const displayScale = originalImageSize.width / (CROP_AREA_SIZE * 2);

      const cropData = {
        originX: (originalImageSize.width - originalImageSize.width / committedScale.value) / 2 - committedTranslateX.value * displayScale,
        originY: (originalImageSize.height - originalImageSize.height / committedScale.value) / 2 - committedTranslateY.value * displayScale,
        width: originalImageSize.width / committedScale.value,
        height: originalImageSize.height / committedScale.value,
      };

      const manipulations = [{ crop: cropData }];
      if (committedRotation.value !== 0) {
        manipulations.push({ rotate: committedRotation.value });
      }

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        params.imageUri,
        manipulations,
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      const newAsset = await MediaLibrary.createAssetAsync(manipulatedImage.uri);
      prependAsset(newAsset);

      Alert.alert('Success', 'Image saved to gallery!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [
    params.imageUri,
    router,
    prependAsset,
    originalImageSize,
    committedScale,
    committedTranslateX,
    committedTranslateY,
    committedRotation,
  ]);

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

  const renderHeader = () => {
    if (editMode === 'crop') {
      return (
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleCancelCrop}>
            <Ionicons name="close" size={24} color="white" />
            <ThemedText style={styles.headerButtonText}>Cancel</ThemedText>
          </Pressable>
          <ThemedText style={styles.title}>Crop & Rotate</ThemedText>
          <Pressable style={styles.headerButton} onPress={handleDoneCrop}>
            <Ionicons name="checkmark" size={24} color="white" />
            <ThemedText style={styles.headerButtonText}>Done</ThemedText>
          </Pressable>
        </View>
      );
    }

    return (
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
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {renderHeader()}
      <View style={styles.imageContainer}>
        <View style={styles.cropOverlay}>
          <View style={styles.cropArea}>
            {editMode === 'crop' && (
              <View style={styles.cropGrid}>
                <View style={[styles.gridLine, styles.gridLineVertical, { left: '33.33%' }]} />
                <View style={[styles.gridLine, styles.gridLineVertical, { left: '66.66%' }]} />
                <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '33.33%' }]} />
                <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '66.66%' }]} />
              </View>
            )}
            <PinchGestureHandler onGestureEvent={pinchHandler} enabled={editMode === 'crop'}>
              <Animated.View style={styles.gestureContainer}>
                <PanGestureHandler onGestureEvent={panHandler} enabled={editMode === 'crop'}>
                  <Animated.View style={[styles.imageWrapper, animatedStyle]}>
                    <ExpoImage
                      source={{ uri: params.imageUri }}
                      style={styles.image}
                      contentFit="contain"
                    />
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
            </PinchGestureHandler>
          </View>
        </View>
      </View>

      {editMode === 'crop' && (
        <View style={styles.cropControls}>
          <Pressable style={styles.controlButton} onPress={handleRotate}>
            <Ionicons name="refresh" size={24} color="white" />
            <ThemedText style={styles.controlButtonText}>Rotate</ThemedText>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={handleReset}>
            <Ionicons name="refresh-outline" size={24} color="white" />
            <ThemedText style={styles.controlButtonText}>Reset</ThemedText>
          </Pressable>
        </View>
      )}

      {editMode === 'view' && (
        <View style={styles.toolbar}>
          <Pressable
            style={styles.toolbarButton}
            onPress={handleEnterCropMode}>
            <Ionicons name="crop" size={24} color="white" />
            <ThemedText style={styles.toolbarButtonText}>Crop & Rotate</ThemedText>
          </Pressable>
        </View>
      )}
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
  cropControls: {
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
  toolbar: {
    height: 100,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
});
