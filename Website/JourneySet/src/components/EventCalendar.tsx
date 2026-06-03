import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, CreditCard as Edit3, Trash2, Calendar as CalendarIcon, Search, AlertCircle } from 'lucide-react';
import { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCompactMode } from '../contexts/CompactModeContext';
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
import { storage } from '../utils/storage';
import { EVENT_CATEGORIES, getCategoryColor, getCategoryLabel } from '../constants/categories';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../api/eventsApi';

const EventCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'personal' as Event['category'],
    time: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { isCompact } = useCompactMode();

  useEffect(() => {
    if (user) {
      const loadEvents = async () => {
        const userEvents = await getEvents(user.id);
        setEvents(userEvents);
      };
      loadEvents();
    }
  }, [user]);

  const saveEvents = (updatedEvents: Event[]) => {
    setEvents(updatedEvents);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowEventModal(true);
    setEditingEvent(null);
    setNewEvent({ title: '', description: '', category: 'personal', time: '' });
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      category: event.category,
      time: event.time || ''
    });
    setSelectedDate(new Date(event.dateISO));
    setShowEventModal(true);
  };

  const checkConflicts = (dateISO: string, time: string, excludeId?: string): Event[] => {
    if (!time) return [];

    return events.filter(event =>
      event.dateISO === dateISO &&
      event.time === time &&
      (!excludeId || event.id !== excludeId)
    );
  };

  const saveEvent = async () => {
    if (!newEvent.title.trim() || !selectedDate || !user) return;

    const dateISO = format(selectedDate, 'yyyy-MM-dd');

    if (editingEvent) {
      const updated = await updateEvent(user.id, editingEvent.id, {
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || undefined,
        category: newEvent.category,
        time: newEvent.time || undefined,
        dateISO
      });

      if (updated) {
        setEvents(events.map(e => e.id === editingEvent.id ? updated : e));
      }
    } else {
      const event = await createEvent(user.id, {
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || undefined,
        category: newEvent.category,
        time: newEvent.time || undefined,
        dateISO
      });

      if (event) {
        setEvents([...events, event]);
      }
    }

    setShowEventModal(false);
    setEditingEvent(null);
  };

  const deleteEventHandler = async (eventId: string) => {
    if (!user) return;
    const success = await deleteEvent(user.id, eventId);
    if (success) {
      setEvents(events.filter(event => event.id !== eventId));
      setShowEventModal(false);
      setEditingEvent(null);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEvents = events.filter(event => event.dateISO === dateStr);

    return dayEvents.sort((a, b) => {
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate);
  };

  const getFilteredEvents = () => {
    if (!searchQuery.trim()) return events;

    const query = searchQuery.toLowerCase();
    return events.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query)
    );
  };


  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const selectedDateEvents = getSelectedDateEvents();
  const dateISO = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const timeConflicts = newEvent.time ? checkConflicts(dateISO, newEvent.time, editingEvent?.id) : [];

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

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search events by title or description..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className={`flex flex-col lg:flex-row ${isCompact ? 'gap-4' : 'gap-6'}`}>
        {/* Calendar */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-auto">
          {/* Week days header */}
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            {weekDays.map(day => (
              <div key={day} className={`text-center ${isCompact ? 'p-2' : 'p-4'}`}>
                <span className={`font-medium text-gray-600 dark:text-gray-300 ${isCompact ? 'text-xs' : 'text-sm'}`}>{isCompact ? day.substring(0, 1) : day}</span>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 auto-rows-min">
            {calendarDays.map(day => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  className={`border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    !isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''
                  } ${isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${
                    isSelected ? 'ring-2 ring-inset ring-blue-400 dark:ring-blue-500' : ''
                  } ${isCompact ? 'min-h-[60px] p-1' : 'min-h-[100px] p-2'}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleDateClick(day);
                    }
                  }}
                >
                  <div className={`font-medium mb-1 ${
                    !isCurrentMonth
                      ? 'text-gray-400 dark:text-gray-600'
                      : isCurrentDay
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white'
                  } ${isCompact ? 'text-xs' : 'text-sm'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className={`space-y-0.5 ${isCompact ? 'text-xs' : 'text-xs'}`}>
                    {dayEvents.slice(0, isCompact ? 1 : 2).map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => handleEventClick(event, e)}
                        className={`rounded text-white cursor-pointer hover:opacity-80 transition-opacity truncate ${getCategoryColor(event.category)} ${isCompact ? 'px-1 py-0.5' : 'px-2 py-1'}`}
                        title={event.title}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleEventClick(event, e as any);
                          }
                        }}
                      >
                        {event.time && <span className="font-semibold">{event.time} </span>}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > (isCompact ? 1 : 2) && (
                      <div className="text-blue-600 dark:text-blue-400 rounded font-medium">
                        +{dayEvents.length - (isCompact ? 1 : 2)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events List Panel */}
        <div className={`lg:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col ${isCompact ? 'p-4' : 'p-6'}`}>
          <h3 className={`font-semibold text-gray-900 dark:text-white mb-4 ${isCompact ? 'text-base' : 'text-lg'}`}>
            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a day'}
          </h3>

          {selectedDate && (
            <>
              {selectedDateEvents.length > 0 ? (
                <div className="flex-1 overflow-y-auto space-y-3">
                  {selectedDateEvents.map(event => (
                    <div
                      key={event.id}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getCategoryColor(event.category)}`}></div>
                          <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                            {event.title}
                          </h4>
                        </div>
                        <div className="flex space-x-1 flex-shrink-0 ml-2">
                          <button
                            onClick={() => handleEventClick(event, { stopPropagation: () => {} } as React.MouseEvent)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => deleteEventHandler(event.id)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      {event.time && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-4 mb-1">
                          {event.time}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 ml-4 mb-1">
                          {event.description}
                        </p>
                      )}
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded ml-4 inline-block">
                        {getCategoryLabel(event.category)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No events</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => handleDateClick(selectedDate)}
                className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Event</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                  <span className="text-gray-900 dark:text-white text-sm">
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
                  Time (optional)
                </label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {timeConflicts.length > 0 && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    <p className="font-medium mb-1">Time conflict detected:</p>
                    <p>{timeConflicts[0].title} is already scheduled at this time</p>
                  </div>
                </div>
              )}

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
                  {EVENT_CATEGORIES.map(category => (
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
