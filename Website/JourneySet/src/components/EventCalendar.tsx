import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit3, Trash2, Calendar as CalendarIcon, Eye } from 'lucide-react';
import { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';

const EventCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAllEventsModal, setShowAllEventsModal] = useState(false);
  const [viewAllEventsDate, setViewAllEventsDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'personal' as Event['category']
  });
  const { user } = useAuth();

  const categories = [
    { value: 'work', label: 'Work', color: 'bg-blue-600' },
    { value: 'personal', label: 'Personal', color: 'bg-green-600' },
    { value: 'health', label: 'Health', color: 'bg-red-600' },
    { value: 'social', label: 'Social', color: 'bg-purple-600' },
    { value: 'other', label: 'Other', color: 'bg-gray-600' }
  ];

  useEffect(() => {
    loadEvents();
  }, [user]);

  const loadEvents = () => {
    if (!user) return;
    const storedEvents = localStorage.getItem(`journeysetEvents_${user.id}`);
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  };

  const saveEvents = (updatedEvents: Event[]) => {
    if (!user) return;
    localStorage.setItem(`journeysetEvents_${user.id}`, JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowEventModal(true);
    setEditingEvent(null);
    setNewEvent({ title: '', description: '', category: 'personal' });
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      category: event.category
    });
    setSelectedDate(new Date(event.date));
    setShowEventModal(true);
  };

  const handleViewAllEvents = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewAllEventsDate(date);
    setShowAllEventsModal(true);
  };

  const saveEvent = () => {
    if (!newEvent.title.trim() || !selectedDate || !user) return;

    if (editingEvent) {
      // Update existing event
      const updatedEvents = events.map(event =>
        event.id === editingEvent.id
          ? {
              ...event,
              title: newEvent.title.trim(),
              description: newEvent.description.trim(),
              category: newEvent.category,
              date: format(selectedDate, 'yyyy-MM-dd')
            }
          : event
      );
      saveEvents(updatedEvents);
    } else {
      // Create new event
      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        category: newEvent.category,
        date: format(selectedDate, 'yyyy-MM-dd'),
        userId: user.id
      };
      const updatedEvents = [...events, event];
      saveEvents(updatedEvents);
    }

    setShowEventModal(false);
    setEditingEvent(null);
  };

  const deleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    saveEvents(updatedEvents);
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.date === dateStr);
  };

  const getCategoryColor = (category: Event['category']) => {
    return categories.find(cat => cat.value === category)?.color || 'bg-gray-600';
  };

  const getCategoryLabel = (category: Event['category']) => {
    return categories.find(cat => cat.value === category)?.label || 'Other';
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Calendar</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your events and appointments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white min-w-[150px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Week days header */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
          {weekDays.map(day => (
            <div key={day} className="p-4 text-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map(day => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`min-h-[100px] p-2 border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''
                } ${isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  !isCurrentMonth 
                    ? 'text-gray-400 dark:text-gray-600' 
                    : isCurrentDay
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`text-xs px-2 py-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity truncate ${getCategoryColor(event.category)}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <button
                      onClick={(e) => handleViewAllEvents(day, e)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-1 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors w-full text-left flex items-center space-x-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>+{dayEvents.length - 2} more</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View All Events Modal */}
      {showAllEventsModal && viewAllEventsDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Events for {format(viewAllEventsDate, 'MMMM d, yyyy')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getEventsForDate(viewAllEventsDate).length} event{getEventsForDate(viewAllEventsDate).length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowAllEventsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5 text-gray-500 transform rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {getEventsForDate(viewAllEventsDate).map(event => (
                <div
                  key={event.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(event.category)}`}></div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          {getCategoryLabel(event.category)}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-5">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEventClick(event, { stopPropagation: () => {} } as React.MouseEvent)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit event"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowAllEventsModal(false);
                  handleDateClick(viewAllEventsDate);
                }}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Event</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingEvent ? 'Edit Event' : 'New Event'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5 text-gray-500 transform rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">
                    {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Event title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Event description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as Event['category'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              {editingEvent && (
                <button
                  onClick={() => deleteEvent(editingEvent.id)}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              )}
              <div className="flex space-x-3 ml-auto">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEvent}
                  disabled={!newEvent.title.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {editingEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;