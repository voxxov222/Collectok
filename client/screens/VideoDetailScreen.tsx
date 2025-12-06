import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInRight,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Video } from "@/lib/types";
import { useFeedStore } from "@/lib/store";

const { width, height } = Dimensions.get("window");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type VideoDetailRouteProp = RouteProp<RootStackParamList, "VideoDetail">;

interface ActionButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  isActive?: boolean;
  onPress: () => void;
  delay: number;
}

function ActionButton({ icon, label, isActive, onPress, delay }: ActionButtonProps) {
  const scale = useSharedValue(1);
  const { isDark } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={SlideInRight.delay(delay).springify()}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.actionButton, animatedStyle]}
      >
        <BlurView intensity={60} tint={isDark ? "dark" : "light"} style={styles.actionButtonBlur}>
          <Feather
            name={icon}
            size={24}
            color={isActive ? Colors.primary : "#FFFFFF"}
          />
        </BlurView>
        <ThemedText style={styles.actionLabel}>{label}</ThemedText>
      </AnimatedPressable>
    </Animated.View>
  );
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }
  return `${views} views`;
}

export default function VideoDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<VideoDetailRouteProp>();
  const { theme, isDark } = useTheme();
  const { video } = route.params;
  const { savedVideos, favorites, pinnedVideos, saveVideo, unsaveVideo, addFavorite, removeFavorite, pinVideo, unpinVideo } = useFeedStore();

  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const isSaved = savedVideos.some((v) => v.id === video.id);
  const isFavorite = favorites.some((v) => v.id === video.id);
  const isPinned = pinnedVideos.some((v) => v.id === video.id);

  const translateY = useSharedValue(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleToggleSave = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isSaved) {
      unsaveVideo(video.id);
    } else {
      saveVideo(video);
    }
  };

  const handleToggleFavorite = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isFavorite) {
      removeFavorite(video.id);
    } else {
      addFavorite(video);
    }
  };

  const handleTogglePin = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isPinned) {
      unpinVideo(video.id);
    } else {
      pinVideo(video);
    }
  };

  const handleTap = () => {
    setShowControls(!showControls);
  };

  const handleDoubleTap = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    handleToggleFavorite();
  };

  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      runOnJS(handleTap)();
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(handleDoubleTap)();
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const composedGestures = Gesture.Exclusive(doubleTapGesture, tapGesture, panGesture);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const playbackSpeeds = [0.5, 1, 1.5, 2, 3, 4];

  const cyclePlaybackSpeed = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const currentIndex = playbackSpeeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % playbackSpeeds.length;
    setPlaybackSpeed(playbackSpeeds[nextIndex]);
  };

  return (
    <GestureDetector gesture={composedGestures}>
      <Animated.View style={[styles.container, { backgroundColor: "#000" }, animatedContainerStyle]}>
        <Image
          source={{ uri: video.thumbnail }}
          style={styles.video}
          resizeMode="cover"
        />

        {showControls && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={StyleSheet.absoluteFill}
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.6)", "transparent", "transparent", "rgba(0,0,0,0.8)"]}
              style={StyleSheet.absoluteFill}
            />

            <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Feather name="x" size={28} color="#FFFFFF" />
              </Pressable>
              <View style={styles.headerRight}>
                <Pressable
                  onPress={cyclePlaybackSpeed}
                  style={({ pressed }) => [styles.speedButton, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <ThemedText style={styles.speedText}>{playbackSpeed}x</ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Feather name="share" size={24} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>

            <View style={styles.centerControls}>
              <Pressable
                onPress={() => setIsPlaying(!isPlaying)}
                style={({ pressed }) => [styles.playButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <BlurView intensity={80} tint="dark" style={styles.playButtonBlur}>
                  <Feather
                    name={isPlaying ? "pause" : "play"}
                    size={40}
                    color="#FFFFFF"
                  />
                </BlurView>
              </Pressable>
            </View>

            <View style={[styles.bottomInfo, { paddingBottom: insets.bottom + Spacing.xl }]}>
              <View style={styles.creatorInfo}>
                <Image source={{ uri: video.creatorAvatar }} style={styles.creatorAvatar} />
                <View>
                  <ThemedText style={styles.creatorName}>{video.creator}</ThemedText>
                  <ThemedText style={styles.videoViews}>{formatViews(video.views)}</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.videoTitle} numberOfLines={2}>
                {video.title}
              </ThemedText>
            </View>
          </Animated.View>
        )}

        <View style={[styles.actionsContainer, { bottom: insets.bottom + 100 }]}>
          <ActionButton
            icon="bookmark"
            label="Save"
            isActive={isSaved}
            onPress={handleToggleSave}
            delay={100}
          />
          <ActionButton
            icon="map-pin"
            label="Pin"
            isActive={isPinned}
            onPress={handleTogglePin}
            delay={200}
          />
          <ActionButton
            icon="heart"
            label="Favorite"
            isActive={isFavorite}
            onPress={handleToggleFavorite}
            delay={300}
          />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    width,
    height,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  speedButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: BorderRadius.md,
  },
  speedText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  centerControls: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -40 }, { translateY: -40 }],
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
  },
  playButtonBlur: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 100,
    paddingHorizontal: Spacing.xl,
  },
  creatorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  creatorName: {
    ...Typography.body,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  videoViews: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.8)",
  },
  videoTitle: {
    ...Typography.body,
    color: "#FFFFFF",
  },
  actionsContainer: {
    position: "absolute",
    right: Spacing.md,
    alignItems: "center",
    gap: Spacing.lg,
  },
  actionButton: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  actionButtonBlur: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(28,28,30,0.8)",
  },
  actionLabel: {
    ...Typography.caption,
    color: "#FFFFFF",
    fontSize: 11,
  },
});
