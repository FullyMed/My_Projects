import { Event } from '../types';

export interface CategoryConfig {
  value: Event['category'];
  label: string;
  color: string;
}

export const EVENT_CATEGORIES: CategoryConfig[] = [
  { value: 'work', label: 'Work', color: 'bg-blue-600' },
  { value: 'personal', label: 'Personal', color: 'bg-green-600' },
  { value: 'health', label: 'Health', color: 'bg-red-600' },
  { value: 'social', label: 'Social', color: 'bg-purple-600' },
  { value: 'other', label: 'Other', color: 'bg-gray-600' }
];

export const getCategoryColor = (category: Event['category']): string => {
  return EVENT_CATEGORIES.find(cat => cat.value === category)?.color || 'bg-gray-600';
};

export const getCategoryLabel = (category: Event['category']): string => {
  return EVENT_CATEGORIES.find(cat => cat.value === category)?.label || 'Other';
};
