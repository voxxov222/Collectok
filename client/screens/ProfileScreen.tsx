import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useFeedStore, useProjectStore } from "@/lib/store";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  isDestructive?: boolean;
  delay: number;
}

function MenuItem({ icon, label, value, onPress, isDestructive, delay }: MenuItemProps) {
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
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.menuItem,
          { backgroundColor: theme.surface, borderColor: theme.border },
          animatedStyle,
        ]}
      >
        <View style={[styles.menuIcon, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather
            name={icon}
            size={20}
            color={isDestructive ? Colors.error : theme.text}
          />
        </View>
        <ThemedText
          style={[
            styles.menuLabel,
            isDestructive && { color: Colors.error },
          ]}
        >
          {label}
        </ThemedText>
        {value ? (
          <ThemedText style={[styles.menuValue, { color: theme.textSecondary }]}>
            {value}
          </ThemedText>
        ) : (
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

interface StatCardProps {
  icon: keyof typeof Feather.glyphMap;
  value: number;
  label: string;
  delay: number;
}

function StatCard({ icon, value, label, delay }: StatCardProps) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <Feather name={icon} size={24} color={Colors.primary} />
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { savedVideos, favorites } = useFeedStore();
  const { projects } = useProjectStore();
  const [selectedTab, setSelectedTab] = useState<"saved" | "favorites">("saved");

  const handleLogout = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your projects and saved content will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "Are you absolutely sure? This will delete everything.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete Forever", style: "destructive", onPress: logout },
              ]
            );
          },
        },
      ]
    );
  };

  const getProviderIcon = (): keyof typeof Feather.glyphMap => {
    switch (user?.provider) {
      case "google":
        return "globe";
      case "github":
        return "github";
      case "apple":
        return "smartphone";
      default:
        return "user";
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
            <Feather name={getProviderIcon()} size={40} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.userName}>{user?.name || "User"}</ThemedText>
          {user?.email ? (
            <ThemedText style={[styles.userEmail, { color: theme.textSecondary }]}>
              {user.email}
            </ThemedText>
          ) : null}
        </Animated.View>

        <View style={styles.statsRow}>
          <StatCard icon="folder" value={projects.length} label="Projects" delay={200} />
          <StatCard icon="bookmark" value={savedVideos.length} label="Saved" delay={250} />
          <StatCard icon="heart" value={favorites.length} label="Favorites" delay={300} />
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            My Content
          </ThemedText>
          <View style={styles.tabsContainer}>
            <Pressable
              onPress={() => setSelectedTab("saved")}
              style={[
                styles.tab,
                selectedTab === "saved" && { backgroundColor: Colors.primary },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: selectedTab === "saved" ? "#FFFFFF" : theme.text },
                ]}
              >
                Saved Videos
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setSelectedTab("favorites")}
              style={[
                styles.tab,
                selectedTab === "favorites" && { backgroundColor: Colors.primary },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: selectedTab === "favorites" ? "#FFFFFF" : theme.text },
                ]}
              >
                Favorites
              </ThemedText>
            </Pressable>
          </View>
          <View style={[styles.contentPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather
              name={selectedTab === "saved" ? "bookmark" : "heart"}
              size={32}
              color={theme.textSecondary}
            />
            <ThemedText style={[styles.placeholderText, { color: theme.textSecondary }]}>
              {selectedTab === "saved"
                ? savedVideos.length === 0
                  ? "No saved videos yet"
                  : `${savedVideos.length} saved videos`
                : favorites.length === 0
                ? "No favorites yet"
                : `${favorites.length} favorites`}
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Account
          </ThemedText>
          <MenuItem
            icon="user"
            label="Edit Profile"
            onPress={() => {}}
            delay={400}
          />
          <MenuItem
            icon="settings"
            label="App Settings"
            onPress={() => {}}
            delay={450}
          />
          <MenuItem
            icon="bell"
            label="Notifications"
            value="On"
            onPress={() => {}}
            delay={500}
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Support
          </ThemedText>
          <MenuItem
            icon="help-circle"
            label="Help Center"
            onPress={() => {}}
            delay={550}
          />
          <MenuItem
            icon="message-circle"
            label="Contact Us"
            onPress={() => {}}
            delay={600}
          />
          <MenuItem
            icon="info"
            label="About"
            value="v1.0.0"
            onPress={() => {}}
            delay={650}
          />
        </View>

        <View style={styles.section}>
          <MenuItem
            icon="log-out"
            label="Log Out"
            onPress={handleLogout}
            isDestructive
            delay={700}
          />
          <MenuItem
            icon="trash-2"
            label="Delete Account"
            onPress={handleDeleteAccount}
            isDestructive
            delay={750}
          />
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
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.small,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  statValue: {
    ...Typography.h2,
    marginTop: Spacing.sm,
  },
  statLabel: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.caption,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  tabText: {
    ...Typography.small,
    fontWeight: "600",
  },
  contentPlaceholder: {
    height: 120,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  placeholderText: {
    ...Typography.small,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    ...Typography.body,
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuValue: {
    ...Typography.small,
  },
});
