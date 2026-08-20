// --- User Types ---
export interface User {
  _id: string;
  username: string;
  email: string;
  profilePic: string;
  bio: string;
  bookmarks: string[];
  preferences: {
    categories: string[];
    theme: "light" | "dark";
  };
  followers: string[];
  followings: string[];
  createdAt: string;
  updatedAt: string;
}

// --- Post Types ---
export interface Comment {
  _id: string;
  username: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  name: string;
  lat: number | null;
  lng: number | null;
  country: string;
  city: string;
}

export interface Post {
  _id: string;
  title: string;
  desc: string;
  photos: string[];
  photo: string;
  banner: string;
  username: string;
  userId: string;
  categories: string[];
  tags: string[];
  location: Location;
  status: "draft" | "published";
  likes: string[];
  bookmarks: string[];
  comments: Comment[];
  views: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

// --- Dashboard Types ---
export interface DashboardStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalPosts: number;
}

export interface DashboardPost {
  postId: string;
  title: string;
  status: string;
  views: number;
  likes: number;
  bookmarks: number;
  comments: number;
  createdAt: string;
}

// --- Category Types ---
export interface Category {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// --- Context Types ---
export type Theme = "light" | "dark";

export type ActionType =
  | "LOGIN_START"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "UPDATE_START"
  | "UPDATE_SUCCESS"
  | "UPDATE_FAILURE"
  | "LOGOUT"
  | "TOGGLE_THEME";

export interface AppState {
  user: User | null;
  token: string | null;
  isFetching: boolean;
  error: boolean;
  theme: Theme;
}

export interface LoginPayload {
  user: User;
  token: string;
}

export type Action =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: LoginPayload }
  | { type: "LOGIN_FAILURE" }
  | { type: "UPDATE_START" }
  | { type: "UPDATE_SUCCESS"; payload: User }
  | { type: "UPDATE_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "TOGGLE_THEME" };

export interface ContextValue {
  user: User | null;
  token: string | null;
  isFetching: boolean;
  error: boolean;
  theme: Theme;
  dispatch: React.Dispatch<Action>;
}

// --- API Response Types ---
export interface PaginatedPosts {
  posts: Post[];
  total: number;
  page: number;
  pages: number;
}

export interface SearchResponse extends PaginatedPosts {
  query: string;
}

// --- Props Types ---
export interface LocationInputProps {
  location: Location;
  onChange: (location: Location) => void;
}

export interface PostsProps {
  posts: Post[];
}
