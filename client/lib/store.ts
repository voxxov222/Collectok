import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video, Project } from "@/lib/types";

interface FeedState {
  savedVideos: Video[];
  favorites: Video[];
  pinnedVideos: Video[];
  saveVideo: (video: Video) => void;
  unsaveVideo: (videoId: string) => void;
  addFavorite: (video: Video) => void;
  removeFavorite: (videoId: string) => void;
  pinVideo: (video: Video) => void;
  unpinVideo: (videoId: string) => void;
  clearAll: () => void;
}

interface ProjectState {
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  getProject: (projectId: string) => Project | undefined;
  clearAll: () => void;
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      savedVideos: [],
      favorites: [],
      pinnedVideos: [],
      saveVideo: (video) =>
        set((state) => {
          if (state.savedVideos.some((v) => v.id === video.id)) return state;
          return { savedVideos: [...state.savedVideos, video] };
        }),
      unsaveVideo: (videoId) =>
        set((state) => ({
          savedVideos: state.savedVideos.filter((v) => v.id !== videoId),
        })),
      addFavorite: (video) =>
        set((state) => {
          if (state.favorites.some((v) => v.id === video.id)) return state;
          return { favorites: [...state.favorites, video] };
        }),
      removeFavorite: (videoId) =>
        set((state) => ({
          favorites: state.favorites.filter((v) => v.id !== videoId),
        })),
      pinVideo: (video) =>
        set((state) => {
          if (state.pinnedVideos.some((v) => v.id === video.id)) return state;
          return { pinnedVideos: [...state.pinnedVideos, video] };
        }),
      unpinVideo: (videoId) =>
        set((state) => ({
          pinnedVideos: state.pinnedVideos.filter((v) => v.id !== videoId),
        })),
      clearAll: () => set({ savedVideos: [], favorites: [], pinnedVideos: [] }),
    }),
    {
      name: "collectok-feed-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (project) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === project.id ? project : p
          ),
        })),
      deleteProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
        })),
      getProject: (projectId) => get().projects.find((p) => p.id === projectId),
      clearAll: () => set({ projects: [] }),
    }),
    {
      name: "collectok-project-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
