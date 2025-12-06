import React from "react";
import { View, StyleSheet, Image, Pressable, Platform, Linking } from "react-native";
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
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AuthButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  backgroundColor: string;
  textColor: string;
  onPress: () => void;
  delay: number;
}

function AuthButton({ icon, label, backgroundColor, textColor, onPress, delay }: AuthButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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
        style={[styles.authButton, { backgroundColor }, animatedStyle]}
      >
        <Feather name={icon} size={24} color={textColor} />
        <ThemedText style={[styles.authButtonText, { color: textColor }]}>
          {label}
        </ThemedText>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, loginAsGuest } = useAuth();
  const { theme, isDark } = useTheme();

  const handleLogin = async (provider: "google" | "github" | "apple") => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await login(provider);
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing["3xl"] }]}>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
          />
          <ThemedText style={styles.appName}>CollecTok</ThemedText>
          <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
            Discover, Collect, Create
          </ThemedText>
        </Animated.View>

        <View style={styles.authContainer}>
          <AuthButton
            icon="globe"
            label="Continue with Google"
            backgroundColor="#FFFFFF"
            textColor="#000000"
            onPress={() => handleLogin("google")}
            delay={200}
          />
          <AuthButton
            icon="github"
            label="Continue with GitHub"
            backgroundColor="#24292E"
            textColor="#FFFFFF"
            onPress={() => handleLogin("github")}
            delay={300}
          />
          {Platform.OS === "ios" && (
            <AuthButton
              icon="smartphone"
              label="Continue with Apple"
              backgroundColor={isDark ? "#FFFFFF" : "#000000"}
              textColor={isDark ? "#000000" : "#FFFFFF"}
              onPress={() => handleLogin("apple")}
              delay={400}
            />
          )}

          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <Pressable
              onPress={loginAsGuest}
              style={({ pressed }) => [
                styles.guestButton,
                { opacity: pressed ? 0.7 : 1, borderColor: theme.border },
              ]}
            >
              <ThemedText style={[styles.guestButtonText, { color: theme.textSecondary }]}>
                Continue as Guest
              </ThemedText>
            </Pressable>
          </Animated.View>
        </View>
      </View>

      <Animated.View 
        entering={FadeInDown.delay(600).springify()}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
          By continuing, you agree to our{" "}
          <ThemedText style={[styles.footerLink, { color: Colors.primary }]}>
            Terms of Service
          </ThemedText>
          {" "}and{" "}
          <ThemedText style={[styles.footerLink, { color: Colors.primary }]}>
            Privacy Policy
          </ThemedText>
        </ThemedText>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
  },
  appName: {
    ...Typography.h1,
    color: Colors.primary,
    fontWeight: "700",
  },
  tagline: {
    ...Typography.body,
    marginTop: Spacing.xs,
  },
  authContainer: {
    gap: Spacing.md,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    ...Shadows.small,
  },
  authButtonText: {
    ...Typography.button,
  },
  guestButton: {
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  guestButtonText: {
    ...Typography.button,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  footerText: {
    ...Typography.caption,
    textAlign: "center",
  },
  footerLink: {
    ...Typography.caption,
  },
});
