import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Video } from "@/lib/types";
import { useFeedStore } from "@/lib/store";

const { width } = Dimensions.get("window");
const CARD_GAP = Spacing.xs;
const CARD_WIDTH = (width - Spacing.md * 2 - CARD_GAP * 2) / 3;
const CARD_HEIGHT = CARD_WIDTH * (16 / 9);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MOCK_VIDEOS: Video[] = Array.from({ length: 24 }, (_, i) => ({
  id: `video_${i}`,
  title: `Trending Video ${i + 1}`,
  creator: `Creator${i + 1}`,
  creatorAvatar: `https://picsum.photos/seed/avatar${i}/100/100`,
  thumbnail: `https://picsum.photos/seed/video${i}/400/711`,
  videoUrl: "",
  views: Math.floor(Math.random() * 1000000) + 10000,
  likes: Math.floor(Math.random() * 100000) + 1000,
  category: ["comedy", "sports", "music", "gaming", "tech", "lifestyle"][i % 6],
  duration: Math.floor(Math.random() * 60) + 15,
}));

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

interface VideoCardProps {
  video: Video;
  onPress: () => void;
}

function VideoCard({ video, onPress }: VideoCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.videoCard, animatedStyle]}
    >
      <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
      />
      <View style={styles.videoInfo}>
        <ThemedText style={styles.creatorName} numberOfLines={1}>
          {video.creator}
        </ThemedText>
        <View style={styles.viewsContainer}>
          <Feather name="eye" size={10} color="#FFFFFF" />
          <ThemedText style={styles.views}>{formatViews(video.views)}</ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}

function HeaderTitle() {
  const { theme } = useTheme();
  return (
    <View style={styles.headerTitleContainer}>
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.headerIcon}
      />
      <ThemedText style={[styles.headerTitle, { color: Colors.primary }]}>
        CollecTok
      </ThemedText>
    </View>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const shuffled = [...MOCK_VIDEOS].sort(() => Math.random() - 0.5);
    setVideos(shuffled);
    setRefreshing(false);
  }, []);

  const handleVideoPress = (video: Video) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate("VideoDetail", { video });
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Video; index: number }) => (
      <Animated.View entering={FadeIn.delay(index * 30)}>
        <VideoCard video={item} onPress={() => handleVideoPress(item)} />
      </Animated.View>
    ),
    []
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <HeaderTitle />
        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Feather name="search" size={20} color={theme.text} />
        </Pressable>
      </View>

      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 }
        ]}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
  },
  headerTitle: {
    ...Typography.h2,
    fontWeight: "700",
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  videoCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  videoInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xs,
  },
  creatorName: {
    ...Typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 10,
  },
  viewsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  views: {
    ...Typography.caption,
    color: "#FFFFFF",
    fontSize: 9,
    opacity: 0.9,
  },
});
