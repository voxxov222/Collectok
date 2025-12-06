import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { TOPICS, Topic } from "@/lib/types";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TopicCardProps {
  topic: Topic;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}

function TopicCard({ topic, isSelected, onToggle, index }: TopicCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95);
    setTimeout(() => {
      scale.value = withSpring(1);
    }, 100);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle();
  };

  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 50).springify()}
      style={styles.topicCardWrapper}
    >
      <AnimatedPressable
        onPress={handlePress}
        style={[
          styles.topicCard,
          {
            backgroundColor: isSelected ? Colors.primary : theme.surface,
            borderColor: isSelected ? Colors.primary : theme.border,
          },
          animatedStyle,
        ]}
      >
        <View style={[
          styles.topicIconContainer,
          { backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : theme.backgroundSecondary }
        ]}>
          <Feather 
            name={topic.icon as keyof typeof Feather.glyphMap} 
            size={28} 
            color={isSelected ? "#FFFFFF" : theme.text} 
          />
        </View>
        <ThemedText 
          style={[
            styles.topicName,
            { color: isSelected ? "#FFFFFF" : theme.text }
          ]}
        >
          {topic.name}
        </ThemedText>
        {isSelected && (
          <View style={styles.checkmark}>
            <Feather name="check" size={16} color="#FFFFFF" />
          </View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function TopicSelectionScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();
  const { theme } = useTheme();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId);
      }
      if (prev.length >= 6) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        return prev;
      }
      return [...prev, topicId];
    });
  };

  const handleContinue = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await completeOnboarding(selectedTopics);
  };

  const canContinue = selectedTopics.length === 6;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedText style={styles.title}>What interests you?</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Pick 6 topics to customize your feed
          </ThemedText>
        </Animated.View>
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={[styles.progressContainer, { backgroundColor: theme.backgroundSecondary }]}
        >
          <View 
            style={[
              styles.progressBar,
              { width: `${(selectedTopics.length / 6) * 100}%` }
            ]} 
          />
          <ThemedText style={[styles.progressText, { color: theme.textSecondary }]}>
            {selectedTopics.length} of 6 selected
          </ThemedText>
        </Animated.View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.topicsGrid,
          { paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {TOPICS.map((topic, index) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            isSelected={selectedTopics.includes(topic.id)}
            onToggle={() => toggleTopic(topic.id)}
            index={index}
          />
        ))}
      </ScrollView>

      <Animated.View
        entering={FadeInUp.delay(600).springify()}
        style={[
          styles.footer,
          { 
            paddingBottom: insets.bottom + Spacing.lg,
            backgroundColor: theme.backgroundRoot,
          }
        ]}
      >
        <Button
          onPress={handleContinue}
          disabled={!canContinue}
          style={styles.continueButton}
        >
          {canContinue ? "Get Started" : `Select ${6 - selectedTopics.length} more`}
        </Button>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    height: 40,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    ...Typography.caption,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  topicsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  topicCardWrapper: {
    width: "47%",
  },
  topicCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  topicIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  topicName: {
    ...Typography.button,
  },
  checkmark: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  continueButton: {
    backgroundColor: Colors.primary,
  },
});
