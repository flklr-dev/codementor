// User Types
export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  profilePicture?: string;
  profilePictureUrl?: string;
  fullProfilePictureUrl?: string;
  pendingEmail?: string;
  emailVerificationToken?: string;
  lastNameChange?: string; // ISO date string of when name was last changed
}

// Auth Types
export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isRegistered: boolean;
  isRegistrationSuccess: boolean;
}

// Lesson Types
export interface Lesson {
  _id: string;
  title: string;
  content: string | Array<{
    title?: string;
    type?: string;
    content: string;
    codeLanguage?: string;
  }>;
  duration: number;
  topic: string;
  order: number;
  courseId: string;
}

// Course Types
export interface Course {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  lessons: Lesson[];
  imageUrl?: string;
  progress?: number;
}

// Achievement Types
export interface Achievement {
  _id: string;
  title: string;
  description: string;
  requirement: string;
  targetValue: number;
  xpReward: number;
  icon: string;
  progress?: number;
  earned?: boolean;
  earnedAt?: Date;
} 