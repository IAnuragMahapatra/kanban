export type Status = 'TRIAGE' | 'TODO' | 'SCHEDULED' | 'READY' | 'RUNNING' | 'BLOCKED' | 'DONE' | 'ARCHIVED';

export type User = 'Anurag';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  author: User;
  assignee: User | null;
  blocker_reason: string | null;
  created_at: string;
  deadline: string | null;
  updated_at: string;
  comments?: { content: string }[];
}

export interface Comment {
  id: string;
  task_id: string;
  author: User;
  content: string;
  created_at: string;
}
