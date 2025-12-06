export interface Video {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  thumbnail: string;
  videoUrl: string;
  views: number;
  likes: number;
  category: string;
  duration: number;
  isLive?: boolean;
  viewerCount?: number;
}

export interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
  items: ProjectItem[];
}

export interface ProjectItem {
  id: string;
  type: "video" | "image";
  source: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  opacity: number;
  playbackSpeed: number;
  startTime?: number;
  endTime?: number;
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
}

export const TOPICS: Topic[] = [
  { id: "comedy", name: "Comedy", icon: "smile" },
  { id: "sports", name: "Sports", icon: "activity" },
  { id: "music", name: "Music", icon: "music" },
  { id: "gaming", name: "Gaming", icon: "monitor" },
  { id: "tech", name: "Tech", icon: "cpu" },
  { id: "lifestyle", name: "Lifestyle", icon: "home" },
  { id: "food", name: "Food", icon: "coffee" },
  { id: "travel", name: "Travel", icon: "map-pin" },
  { id: "fashion", name: "Fashion", icon: "shopping-bag" },
  { id: "art", name: "Art", icon: "pen-tool" },
  { id: "fitness", name: "Fitness", icon: "heart" },
  { id: "education", name: "Education", icon: "book" },
];
