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
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Canvas, useImage, Image as SkiaImage, Rect, Group, Circle } from '@shopify/react-native-skia';


import { ThemedText } from '@/components/ThemedText';
import { useMedia } from '@/context/MediaContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CROP_AREA_SIZE = screenWidth - 40;

type EditMode = 'view' | 'crop';

export default function EditScreen() {
  const params = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const { prependAsset } = useMedia();
  const image = useImage(params.imageUri);

  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number } | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('view');

  const cropX = useSharedValue(50);
  const cropY = useSharedValue(100);
  const cropWidth = useSharedValue(screenWidth - 100);
  const cropHeight = useSharedValue(screenWidth - 100);

  // Active transform values
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


  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const handleCancel = () => router.back();

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
    // Reset active transforms to last committed values
    handleReset();
    setEditMode('view');
  };

  const handleDoneCrop = () => {
    // Commit the active transforms
    committedScale.value = scale.value;
    committedTranslateX.value = translateX.value;
    committedTranslateY.value = translateY.value;
    committedRotation.value = rotation.value;
    setEditMode('view');
  };

  const handleAspectRatioPress = (ratio: number) => {
    const canvasWidth = screenWidth;
    const canvasHeight = screenHeight - 200; // Approximate area for the image view

    let newWidth = cropWidth.value;
    let newHeight = newWidth / ratio;

    if (newHeight > canvasHeight) {
      newHeight = canvasHeight;
      newWidth = newHeight * ratio;
    }
    if (newWidth > canvasWidth) {
        newWidth = canvasWidth;
        newHeight = newWidth / ratio;
    }

    const newX = (screenWidth - newWidth) / 2;
    const newY = (canvasHeight - newHeight) / 2 + 100; // Adjust for header approx

    cropX.value = withSpring(newX);
    cropY.value = withSpring(newY);
    cropWidth.value = withSpring(newWidth);
    cropHeight.value = withSpring(newHeight);
  };

  const handleSave = useCallback(async () => {
    if (!image || !originalImageSize) {
      return;
    }

    // Calculate the scale factor of how the image is displayed with "fit: 'contain'"
    const scaleX = screenWidth / originalImageSize.width;
    const scaleY = (screenHeight - 300) / originalImageSize.height; // Approximate screen space for image
    const scale = Math.min(scaleX, scaleY);

    // Calculate the position of the displayed image within the canvas
    const displayedWidth = originalImageSize.width * scale;
    const displayedHeight = originalImageSize.height * scale;
    const offsetX = (screenWidth - displayedWidth) / 2;
    const offsetY = (screenHeight - displayedHeight) / 2;

    // Translate the on-screen crop rectangle coordinates to the original image's coordinate system
    const cropData = {
        originX: (cropX.value - offsetX) / scale,
        originY: (cropY.value - offsetY) / scale,
        width: cropWidth.value / scale,
        height: cropHeight.value / scale,
    };

    const manipulations = [{ crop: cropData }];
    if (committedRotation.value !== 0) {
        manipulations.push({ rotate: committedRotation.value });
    }

    try {
        setIsProcessing(true);
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            image.uri,
            manipulations,
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        const newAsset = await MediaLibrary.createAssetAsync(manipulatedImage.uri);
        prependAsset(newAsset);
        router.back();
    } catch (error) {
        console.error('Error saving image:', error);
        Alert.alert('Error', 'Failed to save image.');
    } finally {
        setIsProcessing(false);
    }
  }, [image, originalImageSize, prependAsset, router, cropX, cropY, cropWidth, cropHeight, committedRotation]);

  const HANDLE_SIZE = 20; // Increased for easier grabbing

  // --- Gesture Handlers ---
  const panGesture = Gesture.Pan()
    .onChange((event) => {
        cropWidth.value += event.changeX;
        cropHeight.value += event.changeY;
    });
  // ----------------------


  if (!params.imageUri || !image) {
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
        <Canvas style={styles.canvas}>
            <SkiaImage
                image={image}
                x={0}
                y={0}
                width={screenWidth}
                height={screenHeight}
                fit="contain"
            />
            {/* Semi-transparent overlay */}
            <Rect x={0} y={0} width={screenWidth} height={screenHeight} color="rgba(0, 0, 0, 0.5)" />

            {/* The clear crop area, achieved by clipping */}
            <Group clip={{ x: cropX, y: cropY, width: cropWidth, height: cropHeight }}>
                <SkiaImage
                    image={image}
                    fit="contain"
                    x={0}
                    y={0}
                    width={screenWidth}
                    height={screenHeight}
                />
            </Group>

            {/* Crop rectangle border */}
            <Rect
            x={cropX}
            y={cropY}
            width={cropWidth}
            height={cropHeight}
            color="white"
            style="stroke"
            strokeWidth={2}
            />

            {/* Corner handles */}
            <Circle cx={cropX} cy={cropY} r={10} color="white" />
            <Circle cx={() => cropX.value + cropWidth.value} cy={cropY} r={10} color="white" />
            <Circle cx={cropX} cy={() => cropY.value + cropHeight.value} r={10} color="white" />
            <Circle cx={() => cropX.value + cropWidth.value} cy={() => cropY.value + cropHeight.value} r={10} color="white" />
        </Canvas>
        <GestureDetector gesture={panGesture}>
            <Animated.View
            style={[
                styles.handle,
                useAnimatedStyle(() => ({
                transform: [
                    { translateX: cropX.value + cropWidth.value - HANDLE_SIZE },
                    { translateY: cropY.value + cropHeight.value - HANDLE_SIZE },
                ],
                })),
            ]}
            />
      </GestureDetector>
      </View>

      {editMode === 'crop' && (
        <View style={styles.cropControls}>
          <View style={styles.aspectRatioGroup}>
            <Pressable style={styles.aspectRatioButton} onPress={() => handleAspectRatioPress(1 / 1)}>
              <ThemedText style={styles.aspectRatioText}>1:1</ThemedText>
            </Pressable>
            <Pressable style={styles.aspectRatioButton} onPress={() => handleAspectRatioPress(5 / 4)}>
              <ThemedText style={styles.aspectRatioText}>4:5</ThemedText>
            </Pressable>
            <Pressable style={styles.aspectRatioButton} onPress={() => handleAspectRatioPress(9 / 16)}>
              <ThemedText style={styles.aspectRatioText}>16:9</ThemedText>
            </Pressable>
          </View>
          <Pressable style={styles.controlButton} onPress={handleRotate}>
            <Ionicons name="refresh" size={24} color="white" />
            <ThemedText style={styles.controlButtonText}>Rotate</ThemedText>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  canvas: {
    flex: 1,
    width: '100%',
  },
  image: {
    flex: 1,
  },
  cropControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    zIndex: 1,
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
  aspectRatioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  aspectRatioButton: {
    padding: 10,
  },
  aspectRatioText: {
    color: 'white',
    fontWeight: 'bold',
  },
  toolbar: {
    height: 100,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  handle: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.001)', // Almost transparent for debugging
  },
});
