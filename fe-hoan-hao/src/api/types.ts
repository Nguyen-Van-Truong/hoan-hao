// Common API types

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  [key: string]: any;
}

// User types
export interface User {
  id: string;
  username: string;
  email?: string;
  fullName: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  avatar?: string;
  coverImage?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateUserProfileRequest {
  fullName?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  avatar?: string;
  coverImage?: string;
  [key: string]: any;
}

// Auth types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
  countryCode?: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  usernameOrEmailOrPhone: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

// Post types
export interface Post {
  id: string;
  userId: string;
  username: string;
  content: string;
  type: string;
  visibility: 'public' | 'friends' | 'private';
  location?: string;
  feeling?: string;
  isPinned?: boolean;
  isEdited?: boolean;
  createdAt: string;
  updatedAt?: string;
  media?: PostMedia[];
  likes?: number;
  comments?: number;
  shares?: number;
  liked?: boolean;
}

export interface PostMedia {
  id: string;
  postId: string;
  mediaType: 'image' | 'video' | 'audio' | 'file';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  orderPosition?: number;
}

export interface CreatePostRequest {
  content: string;
  type?: string;
  visibility?: 'public' | 'friends' | 'private';
  location?: string;
  feeling?: string;
  media?: {
    mediaType: 'image' | 'video' | 'audio' | 'file';
    mediaUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    orderPosition?: number;
  }[];
  taggedUsers?: string[];
}

export interface UpdatePostRequest {
  content?: string;
  visibility?: 'public' | 'friends' | 'private';
  location?: string;
  feeling?: string;
  isPinned?: boolean;
}

export interface CommentRequest {
  content: string;
  parentId?: string;
}

// Friend types
export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  createdAt: string;
  updatedAt?: string;
  sender?: User;
}

// Message types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker';
  content?: string;
  mediaUrl?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  replyTo?: string;
  createdAt: string;
  updatedAt?: string;
  sender?: User;
}

export interface Conversation {
  id: string;
  title?: string;
  type: 'private' | 'group';
  createdBy: string;
  lastMessageId?: string;
  lastActivity: string;
  createdAt: string;
  updatedAt?: string;
  members?: ConversationMember[];
  lastMessage?: Message;
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  nickname?: string;
  role: 'member' | 'admin';
  isMuted?: boolean;
  joinedAt: string;
  leftAt?: string;
  user?: User;
}

// Profile types
export interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  last_login_at: string;
  bio: string;
  location: string;
  country_id: number | null;
  province_id: number | null;
  district_id: number | null;
  website: string;
  profile_picture_url: string;
  cover_picture_url: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}
