import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "github" | "apple" | "guest";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  login: (provider: "google" | "github" | "apple") => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (topics: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "@collectok_auth";
const ONBOARDING_KEY = "@collectok_onboarded";
const TOPICS_KEY = "@collectok_topics";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    loadAuth();
  }, []);

  const loadAuth = async () => {
    try {
      const [authData, onboardedData] = await Promise.all([
        AsyncStorage.getItem(AUTH_STORAGE_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);
      if (authData) {
        setUser(JSON.parse(authData));
      }
      setIsOnboarded(onboardedData === "true");
    } catch (error) {
      console.error("Error loading auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (provider: "google" | "github" | "apple") => {
    const mockUser: User = {
      id: `user_${Date.now()}`,
      name: provider === "google" ? "Google User" : provider === "github" ? "GitHub User" : "Apple User",
      email: `user@${provider}.com`,
      provider,
    };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const loginAsGuest = async () => {
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      name: "Guest",
      email: "",
      provider: "guest",
    };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
    setIsOnboarded(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, ONBOARDING_KEY, TOPICS_KEY]);
    setUser(null);
    setIsOnboarded(false);
  };

  const completeOnboarding = async (topics: string[]) => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    await AsyncStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
    setIsOnboarded(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isOnboarded,
        login,
        loginAsGuest,
        logout,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
