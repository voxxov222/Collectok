import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeInUp,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Project, ProjectItem } from "@/lib/types";
import { useProjectStore } from "@/lib/store";

const { width, height } = Dimensions.get("window");

type ProjectCanvasRouteProp = RouteProp<RootStackParamList, "ProjectCanvas">;

interface ToolButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  isActive?: boolean;
  onPress: () => void;
}

function ToolButton({ icon, label, isActive, onPress }: ToolButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

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
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.toolButton,
          isActive && { backgroundColor: Colors.primary + "30" },
        ]}
      >
        <Feather
          name={icon}
          size={24}
          color={isActive ? Colors.primary : theme.text}
        />
        <ThemedText
          style={[
            styles.toolLabel,
            { color: isActive ? Colors.primary : theme.textSecondary },
          ]}
        >
          {label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export default function ProjectCanvasScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<ProjectCanvasRouteProp>();
  const { theme, isDark } = useTheme();
  const { projects, addProject, updateProject, getProject } = useProjectStore();

  const { projectId } = route.params;
  const existingProject = projectId ? getProject(projectId) : null;

  const [project, setProject] = useState<Project>(() => {
    if (existingProject) return existingProject;
    return {
      id: `project_${Date.now()}`,
      name: "Untitled Project",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: [],
    };
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const canvasScale = useSharedValue(1);
  const canvasX = useSharedValue(0);
  const canvasY = useSharedValue(0);

  const handleClose = () => {
    if (project.items.length > 0 || project.name !== "Untitled Project") {
      Alert.alert(
        "Save Project?",
        "Do you want to save your changes before closing?",
        [
          { text: "Discard", style: "destructive", onPress: () => navigation.goBack() },
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            onPress: () => {
              handleSave();
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSave = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const updatedProject = { ...project, updatedAt: Date.now() };
    if (existingProject) {
      updateProject(updatedProject);
    } else {
      addProject(updatedProject);
    }
  };

  const handleDone = () => {
    handleSave();
    navigation.goBack();
  };

  const handleAddVideo = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const newItem: ProjectItem = {
      id: `item_${Date.now()}`,
      type: "video",
      source: `https://picsum.photos/seed/${Date.now()}/400/711`,
      x: width / 2 - 100,
      y: height / 2 - 150,
      width: 200,
      height: 300,
      rotation: 0,
      scale: 1,
      opacity: 1,
      playbackSpeed: 1,
    };
    setProject((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleAddImage = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const newItem: ProjectItem = {
      id: `item_${Date.now()}`,
      type: "image",
      source: `https://picsum.photos/seed/${Date.now()}/400/400`,
      x: width / 2 - 100,
      y: height / 2 - 100,
      width: 200,
      height: 200,
      rotation: 0,
      scale: 1,
      opacity: 1,
      playbackSpeed: 1,
    };
    setProject((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const cyclePlaybackSpeed = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const speeds = [0.25, 0.5, 1, 2, 3, 4];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const handleExport = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert(
      "Export Project",
      "Choose where to export your creation",
      [
        { text: "Save to Device", onPress: () => {} },
        { text: "Share to Instagram", onPress: () => {} },
        { text: "Share to TikTok", onPress: () => {} },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      canvasScale.value = Math.max(0.5, Math.min(3, event.scale));
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      canvasX.value = event.translationX;
      canvasY.value = event.translationY;
    });

  const canvasAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: canvasX.value },
      { translateY: canvasY.value },
      { scale: canvasScale.value },
    ],
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Animated.View
        entering={FadeIn}
        style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.surface }]}
      >
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>

        <Pressable
          onPress={() => setIsEditingName(true)}
          style={styles.titleContainer}
        >
          {isEditingName ? (
            <TextInput
              value={project.name}
              onChangeText={(text) => setProject((prev) => ({ ...prev, name: text }))}
              onBlur={() => setIsEditingName(false)}
              autoFocus
              style={[styles.titleInput, { color: theme.text }]}
              selectTextOnFocus
            />
          ) : (
            <View style={styles.titleRow}>
              <ThemedText style={styles.title} numberOfLines={1}>
                {project.name}
              </ThemedText>
              <Feather name="edit-2" size={14} color={theme.textSecondary} />
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={handleDone}
          style={({ pressed }) => [
            styles.doneButton,
            { backgroundColor: Colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <ThemedText style={styles.doneText}>Done</ThemedText>
        </Pressable>
      </Animated.View>

      <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
        <Animated.View style={[styles.canvas, canvasAnimatedStyle]}>
          <View style={[styles.canvasGrid, { borderColor: theme.border }]}>
            {project.items.length === 0 ? (
              <View style={styles.emptyCanvas}>
                <Feather name="plus-circle" size={48} color={theme.textSecondary} />
                <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Add videos or images to start creating
                </ThemedText>
              </View>
            ) : (
              project.items.map((item) => (
                <Animated.View
                  key={item.id}
                  entering={FadeIn}
                  style={[
                    styles.canvasItem,
                    {
                      left: item.x,
                      top: item.y,
                      width: item.width,
                      height: item.height,
                      transform: [
                        { rotate: `${item.rotation}deg` },
                        { scale: item.scale },
                      ],
                      opacity: item.opacity,
                    },
                  ]}
                >
                  <Animated.Image
                    source={{ uri: item.source }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.itemBorder} />
                </Animated.View>
              ))
            )}
          </View>
        </Animated.View>
      </GestureDetector>

      <Pressable
        onPress={handleExport}
        style={[styles.exportButton, { top: insets.top + 70 }]}
      >
        <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={styles.exportButtonBlur}>
          <Feather name="share" size={20} color={theme.text} />
        </BlurView>
      </Pressable>

      <Animated.View
        entering={FadeInUp.delay(200)}
        style={[
          styles.toolbar,
          { backgroundColor: theme.surface, paddingBottom: insets.bottom + Spacing.sm },
        ]}
      >
        <View style={styles.toolbarRow}>
          <ToolButton icon="plus" label="Video" onPress={handleAddVideo} />
          <ToolButton icon="image" label="Image" onPress={handleAddImage} />
          <ToolButton
            icon={isPlaying ? "pause" : "play"}
            label={isPlaying ? "Pause" : "Play"}
            isActive={isPlaying}
            onPress={() => setIsPlaying(!isPlaying)}
          />
          <Pressable
            onPress={cyclePlaybackSpeed}
            style={[styles.speedSelector, { backgroundColor: theme.backgroundSecondary }]}
          >
            <ThemedText style={styles.speedText}>{playbackSpeed}x</ThemedText>
          </Pressable>
          <ToolButton
            icon="rotate-cw"
            label="Rotate"
            isActive={selectedTool === "rotate"}
            onPress={() => setSelectedTool(selectedTool === "rotate" ? null : "rotate")}
          />
          <ToolButton
            icon="maximize-2"
            label="Scale"
            isActive={selectedTool === "scale"}
            onPress={() => setSelectedTool(selectedTool === "scale" ? null : "scale")}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: Spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    ...Typography.body,
    fontWeight: "600",
  },
  titleInput: {
    ...Typography.body,
    fontWeight: "600",
    textAlign: "center",
    minWidth: 150,
  },
  doneButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  doneText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  canvas: {
    flex: 1,
  },
  canvasGrid: {
    flex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  emptyCanvas: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    textAlign: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  canvasItem: {
    position: "absolute",
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },
  exportButton: {
    position: "absolute",
    right: Spacing.lg,
    borderRadius: 20,
    overflow: "hidden",
    ...Shadows.small,
  },
  exportButtonBlur: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  toolbarRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  toolButton: {
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 50,
  },
  toolLabel: {
    ...Typography.caption,
    marginTop: Spacing.xs,
    fontSize: 10,
  },
  speedSelector: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  speedText: {
    ...Typography.small,
    fontWeight: "600",
  },
});
