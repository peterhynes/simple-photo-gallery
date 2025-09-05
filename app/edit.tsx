import { Ionicons } from '@expo/vector-icons';
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
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { useMedia } from '@/context/MediaContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type EditMode = 'view' | 'crop';

export default function EditScreen() {
  const params = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const { prependAsset } = useMedia();

  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number } | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('view');

  // --- Crop rectangle state ---
  const cropX = useSharedValue(50);
  const cropY = useSharedValue(100);
  const cropWidth = useSharedValue(screenWidth - 100);
  const cropHeight = useSharedValue(screenWidth - 100);
  // --------------------------

  useEffect(() => {
    if (params.imageUri) {
      Image.getSize(params.imageUri, (width, height) => {
        setOriginalImageSize({ width, height });
      });
    }
  }, [params.imageUri]);


  // --- Animated styles for the UI ---
  const topOverlayStyle = useAnimatedStyle(() => ({ top: 0, left: 0, right: 0, height: cropY.value }));
  const bottomOverlayStyle = useAnimatedStyle(() => ({ top: cropY.value + cropHeight.value, left: 0, right: 0, bottom: 0 }));
  const leftOverlayStyle = useAnimatedStyle(() => ({ top: cropY.value, left: 0, width: cropX.value, height: cropHeight.value }));
  const rightOverlayStyle = useAnimatedStyle(() => ({ top: cropY.value, left: cropX.value + cropWidth.value, right: 0, height: cropHeight.value }));
  const borderStyle = useAnimatedStyle(() => ({ position: 'absolute', left: cropX.value, top: cropY.value, width: cropWidth.value, height: cropHeight.value, borderWidth: 2, borderColor: 'white' }));

  const HANDLE_SIZE = 20;
  const bottomRightHandleStyle = useAnimatedStyle(() => ({ position: 'absolute', left: cropX.value + cropWidth.value - HANDLE_SIZE / 2, top: cropY.value + cropHeight.value - HANDLE_SIZE / 2 }));
  // --------------------------------

  // --- Gesture Logic ---
  const gestureContext = useSharedValue({ x: 0, y: 0 });
  const panGesture = Gesture.Pan()
    .onStart(() => {
      gestureContext.value = { x: cropWidth.value, y: cropHeight.value };
    })
    .onUpdate((event) => {
      cropWidth.value = gestureContext.value.x + event.translationX;
      cropHeight.value = gestureContext.value.y + event.translationY;
    });
  // ---------------------

  // --- UI Handlers ---
  const handleCancel = () => router.back();
  const handleEnterCropMode = () => setEditMode('crop');
  const handleCancelCrop = () => setEditMode('view');
  const handleDoneCrop = () => setEditMode('view');

  const handleAspectRatioPress = (ratio: number) => {
    const canvasWidth = screenWidth;
    const canvasHeight = screenHeight - 300; // Approximate usable height

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
    const newY = (canvasHeight - newHeight) / 2 + 100;

    cropX.value = withSpring(newX);
    cropY.value = withSpring(newY);
    cropWidth.value = withSpring(newWidth);
    cropHeight.value = withSpring(newHeight);
  };

  const handleSave = useCallback(async () => {
    if (!params.imageUri || !originalImageSize) return;

    const scaleX = screenWidth / originalImageSize.width;
    const scaleY = (screenHeight) / originalImageSize.height;
    const scale = Math.min(scaleX, scaleY);

    const displayedWidth = originalImageSize.width * scale;
    const displayedHeight = originalImageSize.height * scale;
    const offsetX = (screenWidth - displayedWidth) / 2;
    const offsetY = (screenHeight - displayedHeight) / 2;

    const cropData = {
        originX: (cropX.value - offsetX) / scale,
        originY: (cropY.value - offsetY) / scale,
        width: cropWidth.value / scale,
        height: cropHeight.value / scale,
    };

    try {
        setIsProcessing(true);
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            params.imageUri,
            [{ crop: cropData }],
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
  }, [params.imageUri, originalImageSize, prependAsset, router, cropX, cropY, cropWidth, cropHeight]);
  // -----------------

  if (!params.imageUri) {
    return <View style={styles.container}><ThemedText>No image selected</ThemedText></View>;
  }

  const renderHeader = () => (
    <View style={styles.header}>
      {editMode === 'view' ? (
        <>
          <Pressable style={styles.headerButton} onPress={handleCancel}><Ionicons name="close" size={24} color="white" /><ThemedText style={styles.headerButtonText}>Cancel</ThemedText></Pressable>
          <ThemedText style={styles.title}>Edit Photo</ThemedText>
          <Pressable style={[styles.headerButton, isProcessing && styles.disabledButton]} onPress={handleSave} disabled={isProcessing}>
            {isProcessing ? <ActivityIndicator size="small" color="white" /> : <><Ionicons name="checkmark" size={24} color="white" /><ThemedText style={styles.headerButtonText}>Save</ThemedText></>}
          </Pressable>
        </>
      ) : (
        <>
          <Pressable style={styles.headerButton} onPress={handleCancelCrop}><Ionicons name="close" size={24} color="white" /><ThemedText style={styles.headerButtonText}>Cancel</ThemedText></Pressable>
          <ThemedText style={styles.title}>Crop</ThemedText>
          <Pressable style={styles.headerButton} onPress={handleDoneCrop}><Ionicons name="checkmark" size={24} color="white" /><ThemedText style={styles.headerButtonText}>Done</ThemedText></Pressable>
        </>
      )}
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      {renderHeader()}
      <View style={styles.imageContainer}>
        <Image source={{ uri: params.imageUri }} style={styles.image} resizeMode="contain" />
        <Animated.View style={[styles.overlay, topOverlayStyle]} />
        <Animated.View style={[styles.overlay, bottomOverlayStyle]} />
        <Animated.View style={[styles.overlay, leftOverlayStyle]} />
        <Animated.View style={[styles.overlay, rightOverlayStyle]} />
        <Animated.View style={borderStyle} />
        <GestureDetector gesture={panGesture}><Animated.View style={[styles.handle, bottomRightHandleStyle]} /></GestureDetector>
      </View>
      {editMode === 'view' && (
        <View style={styles.toolbar}><Pressable style={styles.toolbarButton} onPress={handleEnterCropMode}><Ionicons name="crop" size={24} color="white" /><ThemedText style={styles.toolbarButtonText}>Crop</ThemedText></Pressable></View>
      )}
      {editMode === 'crop' && (
        <View style={styles.cropControls}>
          <Pressable style={styles.aspectRatioButton} onPress={() => handleAspectRatioPress(1/1)}><ThemedText style={styles.aspectRatioText}>1:1</ThemedText></Pressable>
          <Pressable style={styles.aspectRatioButton} onPress={() => handleAspectRatioPress(4/5)}><ThemedText style={styles.aspectRatioText}>4:5</ThemedText></Pressable>
          <Pressable style={styles.aspectRatioButton} onPress={() => handleAspectRatioPress(16/9)}><ThemedText style={styles.aspectRatioText}>16:9</ThemedText></Pressable>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  imageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: { position: 'absolute', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  handle: { width: 20, height: 20, backgroundColor: 'white', borderWidth: 2, borderColor: 'black', borderRadius: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  headerButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerButtonText: { color: 'white', fontSize: 16 },
  disabledButton: { opacity: 0.5 },
  title: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  toolbar: { height: 100, width: '100%', position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  toolbarButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolbarButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  cropControls: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 20 },
  aspectRatioButton: { padding: 10 },
  aspectRatioText: { color: 'white', fontWeight: 'bold' },
});
