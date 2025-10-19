export interface Member {
  id: string;
  name: string;
  role: string;
  contact: string;
  createdAt: Date;
}

export type TaskStatus = 'not-started' | 'in-progress' | 'review' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  base64Data: string;
  uploadedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  assignedMembers: string[]; // Member IDs
  status: TaskStatus;
  subtasks: Subtask[];
  attachments: TaskAttachment[];
  createdAt: Date;
}

export interface RatingDimensions {
  quality: number; // 1-5
  timeliness: number; // 1-5
  communication: number; // 1-5
  initiative: number; // 1-5
}

export type RatingMode = 'daily' | 'final';

export interface Rating {
  id: string;
  taskId: string;
  memberId: string;
  dimensions: RatingDimensions;
  comments: string;
  mode: RatingMode;
  timestamp: Date;
}

export interface MemberStats {
  totalTasks: number;
  completedTasks: number;
  averageRating: number;
  completionRate: number;
  ratingTrend: { date: Date; rating: number }[];
}

export interface TaskStats {
  totalAssignees: number;
  completedSubtasks: number;
  totalSubtasks: number;
  averageRatings: { [memberId: string]: number };
}
