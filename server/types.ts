import { Document, Types } from "mongoose";
import { Request } from "express";

// --- User Types ---
export interface IUser {
  username: string;
  email: string;
  password: string;
  profilePic: string;
  bio: string;
  bookmarks: Types.ObjectId[];
  preferences: {
    categories: string[];
    theme: "light" | "dark";
  };
  followers: Types.ObjectId[];
  followings: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

// --- Post Types ---
export interface IComment {
  username: string;
  userId: Types.ObjectId;
  text: string;
}

export interface ICommentDocument extends IComment, Document {}

export interface ILocation {
  name: string;
  lat: number | null;
  lng: number | null;
  country: string;
  city: string;
}

export interface IPost {
  title: string;
  desc: string;
  photos: string[];
  photo: string;
  banner: string;
  username: string;
  userId: Types.ObjectId;
  categories: string[];
  tags: string[];
  location: ILocation;
  status: "draft" | "published";
  likes: Types.ObjectId[];
  bookmarks: Types.ObjectId[];
  comments: ICommentDocument[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostDocument extends IPost, Document {}

// --- Category Types ---
export interface ICategory {
  name: string;
}

export interface ICategoryDocument extends ICategory, Document {}

// --- Newsletter Types ---
export interface INewsletter {
  email: string;
  userId: Types.ObjectId | null;
  active: boolean;
}

export interface INewsletterDocument extends INewsletter, Document {}

// --- Report Types ---
export interface IReport {
  reporterId: Types.ObjectId;
  reporterUsername: string;
  targetType: "post" | "comment" | "user";
  targetId: Types.ObjectId;
  reason:
    | "spam"
    | "inappropriate"
    | "harassment"
    | "false-information"
    | "copyright"
    | "other";
  description: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
}

export interface IReportDocument extends IReport, Document {}

// --- JWT Types ---
export interface JwtPayload {
  id: string;
  username: string;
}

// --- Request Types ---
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// --- API Response Types ---
export interface PaginatedResponse<T> {
  posts: T[];
  total: number;
  page: number;
  pages: number;
}

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
  createdAt: Date;
}

export interface PostAnalytics {
  postId: string;
  title: string;
  views: number;
  likes: number;
  bookmarks: number;
  comments: number;
  createdAt: Date;
}
