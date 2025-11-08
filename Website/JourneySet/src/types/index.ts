export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Task {
  id: string;
  text: string;
  day: string;
  time?: string;
  completed: boolean;
  userId: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
  userId: string;
  weekStart: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'work' | 'personal' | 'health' | 'social' | 'other';
  userId: string;
}

export interface Quote {
  text: string;
  author: string;
}