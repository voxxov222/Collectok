import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import LoginScreen from "@/screens/LoginScreen";
import TopicSelectionScreen from "@/screens/TopicSelectionScreen";
import VideoDetailScreen from "@/screens/VideoDetailScreen";
import ProjectCanvasScreen from "@/screens/ProjectCanvasScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Video, Project } from "@/lib/types";

export type RootStackParamList = {
  Login: undefined;
  TopicSelection: undefined;
  Main: undefined;
  VideoDetail: { video: Video };
  ProjectCanvas: { projectId: string | undefined };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const { user, isLoading, isOnboarded } = useAuth();
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.backgroundRoot }}>
        <ActivityIndicator size="large" color={theme.tabIconSelected} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!user ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : !isOnboarded ? (
        <Stack.Screen
          name="TopicSelection"
          component={TopicSelectionScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VideoDetail"
            component={VideoDetailScreen}
            options={{
              presentation: "fullScreenModal",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ProjectCanvas"
            component={ProjectCanvasScreen}
            options={{
              presentation: "fullScreenModal",
              headerShown: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}