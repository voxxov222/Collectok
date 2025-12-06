import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeInDown,
  Layout,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Project } from "@/lib/types";
import { useProjectStore } from "@/lib/store";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  onDelete: () => void;
  index: number;
}

function ProjectCard({ project, onPress, onDelete, index }: ProjectCardProps) {
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

  const handleDelete = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete "${project.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      layout={Layout.springify()}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.projectCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
          animatedStyle,
        ]}
      >
        <View style={[styles.projectThumbnail, { backgroundColor: theme.backgroundSecondary }]}>
          {project.items.length > 0 ? (
            <Feather name="layers" size={32} color={Colors.primary} />
          ) : (
            <Feather name="file" size={32} color={theme.textSecondary} />
          )}
        </View>
        <View style={styles.projectInfo}>
          <ThemedText style={styles.projectName} numberOfLines={1}>
            {project.name}
          </ThemedText>
          <ThemedText style={[styles.projectMeta, { color: theme.textSecondary }]}>
            {project.items.length} items · {formatDate(project.updatedAt)}
          </ThemedText>
        </View>
        <View style={styles.projectActions}>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="trash-2" size={18} color={Colors.error} />
          </Pressable>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function EmptyState() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Animated.View entering={FadeIn.delay(200)} style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name="folder-plus" size={48} color={theme.textSecondary} />
      </View>
      <ThemedText style={styles.emptyTitle}>No Projects Yet</ThemedText>
      <ThemedText style={[styles.emptyDescription, { color: theme.textSecondary }]}>
        Create your first project to start collecting and organizing videos
      </ThemedText>
      <Button
        onPress={() => navigation.navigate("ProjectCanvas", { projectId: undefined })}
        style={styles.createButton}
      >
        Create Project
      </Button>
    </Animated.View>
  );
}

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { projects, deleteProject } = useProjectStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const handleProjectPress = (project: Project) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate("ProjectCanvas", { projectId: project.id });
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Project; index: number }) => (
      <ProjectCard
        project={item}
        onPress={() => handleProjectPress(item)}
        onDelete={() => handleDeleteProject(item.id)}
        index={index}
      />
    ),
    []
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <ThemedText style={styles.screenTitle}>My Projects</ThemedText>
        <ThemedText style={[styles.projectCount, { color: theme.textSecondary }]}>
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </ThemedText>
      </View>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
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
        />
      )}
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
  screenTitle: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  projectCount: {
    ...Typography.small,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  projectThumbnail: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  projectInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  projectName: {
    ...Typography.body,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  projectMeta: {
    ...Typography.caption,
  },
  projectActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptyDescription: {
    ...Typography.body,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  createButton: {
    paddingHorizontal: Spacing["3xl"],
    backgroundColor: Colors.primary,
  },
});
