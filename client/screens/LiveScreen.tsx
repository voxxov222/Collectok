import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeInRight,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import { Video } from "@/lib/types";

const { width } = Dimensions.get("window");
const FEATURED_WIDTH = width - Spacing.xl * 2;
const FEATURED_HEIGHT = FEATURED_WIDTH * (9 / 16);
const CARD_WIDTH = width * 0.7;
const CARD_HEIGHT = CARD_WIDTH * (9 / 16);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MOCK_LIVE_STREAMS: Video[] = Array.from({ length: 10 }, (_, i) => ({
  id: `live_${i}`,
  title: `Live Stream ${i + 1} - Gaming Session`,
  creator: `Streamer${i + 1}`,
  creatorAvatar: `https://picsum.photos/seed/streamer${i}/100/100`,
  thumbnail: `https://picsum.photos/seed/live${i}/800/450`,
  videoUrl: "",
  views: 0,
  likes: 0,
  category: ["gaming", "music", "sports", "tech", "lifestyle"][i % 5],
  duration: 0,
  isLive: true,
  viewerCount: Math.floor(Math.random() * 50000) + 100,
}));

function formatViewers(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

interface LiveBadgeProps {
  size?: "small" | "large";
}

function LiveBadge({ size = "small" }: LiveBadgeProps) {
  const isLarge = size === "large";
  return (
    <View style={[styles.liveBadge, isLarge && styles.liveBadgeLarge]}>
      <View style={[styles.liveDot, isLarge && styles.liveDotLarge]} />
      <ThemedText style={[styles.liveText, isLarge && styles.liveTextLarge]}>
        LIVE
      </ThemedText>
    </View>
  );
}

interface FeaturedStreamProps {
  stream: Video;
  onPress: () => void;
}

function FeaturedStream({ stream, onPress }: FeaturedStreamProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.featuredCard, animatedStyle]}
    >
      <Image source={{ uri: stream.thumbnail }} style={styles.featuredImage} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.9)"]}
        style={styles.featuredGradient}
      />
      <View style={styles.featuredBadgeContainer}>
        <LiveBadge size="large" />
        <View style={styles.viewersBadge}>
          <Feather name="eye" size={12} color="#FFFFFF" />
          <ThemedText style={styles.viewersText}>
            {formatViewers(stream.viewerCount || 0)}
          </ThemedText>
        </View>
      </View>
      <View style={styles.featuredInfo}>
        <View style={styles.creatorRow}>
          <Image source={{ uri: stream.creatorAvatar }} style={styles.avatarLarge} />
          <View style={styles.creatorInfo}>
            <ThemedText style={styles.featuredCreator}>{stream.creator}</ThemedText>
            <ThemedText style={styles.featuredTitle} numberOfLines={1}>
              {stream.title}
            </ThemedText>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

interface StreamCardProps {
  stream: Video;
  onPress: () => void;
  index: number;
}

function StreamCard({ stream, onPress, index }: StreamCardProps) {
  const { theme } = useTheme();
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
    <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.streamCard, animatedStyle]}
      >
        <Image source={{ uri: stream.thumbnail }} style={styles.streamImage} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.streamGradient}
        />
        <View style={styles.streamBadges}>
          <LiveBadge />
          <View style={styles.viewersBadgeSmall}>
            <Feather name="eye" size={10} color="#FFFFFF" />
            <ThemedText style={styles.viewersTextSmall}>
              {formatViewers(stream.viewerCount || 0)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.streamInfo}>
          <Image source={{ uri: stream.creatorAvatar }} style={styles.avatar} />
          <View style={styles.streamTextInfo}>
            <ThemedText style={styles.streamCreator}>{stream.creator}</ThemedText>
            <ThemedText style={styles.streamCategory}>{stream.category}</ThemedText>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [streams, setStreams] = useState<Video[]>(MOCK_LIVE_STREAMS);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStreams([...MOCK_LIVE_STREAMS].sort(() => Math.random() - 0.5));
    setRefreshing(false);
  }, []);

  const handleStreamPress = (stream: Video) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const featuredStream = streams[0];
  const otherStreams = streams.slice(1);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + 80 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <ThemedText style={styles.screenTitle}>Live Now</ThemedText>
          <View style={styles.liveCountContainer}>
            <View style={styles.liveDotPulse} />
            <ThemedText style={[styles.liveCount, { color: theme.textSecondary }]}>
              {streams.length} streams
            </ThemedText>
          </View>
        </View>

        <Animated.View entering={FadeIn.delay(100)}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Featured
          </ThemedText>
          <FeaturedStream
            stream={featuredStream}
            onPress={() => handleStreamPress(featuredStream)}
          />
        </Animated.View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Trending Streams
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {otherStreams.map((stream, index) => (
              <StreamCard
                key={stream.id}
                stream={stream}
                onPress={() => handleStreamPress(stream)}
                index={index}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  screenTitle: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  liveCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  liveDotPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.live,
  },
  liveCount: {
    ...Typography.small,
  },
  sectionTitle: {
    ...Typography.caption,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  featuredCard: {
    width: FEATURED_WIDTH,
    height: FEATURED_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing["2xl"],
    ...Shadows.medium,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  featuredBadgeContainer: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.live,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  liveBadgeLarge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  liveDotLarge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    ...Typography.caption,
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 10,
  },
  liveTextLarge: {
    fontSize: 12,
  },
  viewersBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  viewersText: {
    ...Typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  featuredInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  creatorInfo: {
    flex: 1,
  },
  featuredCreator: {
    ...Typography.body,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  featuredTitle: {
    ...Typography.small,
    color: "rgba(255,255,255,0.8)",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  horizontalList: {
    gap: Spacing.md,
    paddingRight: Spacing.xl,
  },
  streamCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    ...Shadows.small,
  },
  streamImage: {
    width: "100%",
    height: "100%",
  },
  streamGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  streamBadges: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: "row",
    gap: Spacing.xs,
  },
  viewersBadgeSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    gap: 3,
  },
  viewersTextSmall: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  streamInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  streamTextInfo: {
    flex: 1,
  },
  streamCreator: {
    ...Typography.small,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  streamCategory: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.7)",
    textTransform: "capitalize",
  },
});
