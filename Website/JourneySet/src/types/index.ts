export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface PlannerTask {
  id: string;
  title: string;
  dayKey: string;
  weekKey: string;
  time?: string;
  completed: boolean;
  recurring: 'none' | 'weekly';
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  allowExceedTarget: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GoalStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface CalendarEvent {
  id: string;
  dateISO: string;
  time?: string;
  title: string;
  description?: string;
  category: 'work' | 'personal' | 'health' | 'social' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  text: string;
  author: string;
}

export type Task = PlannerTask;
export type Event = CalendarEvent;