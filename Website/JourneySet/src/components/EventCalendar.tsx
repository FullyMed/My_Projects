import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, CreditCard as Edit3, Trash2, Calendar as CalendarIcon, Search, AlertCircle, X } from 'lucide-react';
import { Event } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useCompactMode } from '../hooks/useCompactMode';
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
  isToday,
} from 'date-fns';
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
    time: '',
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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowEventModal(true);
    setEditingEvent(null);
    setNewEvent({ title: '', description: '', category: 'personal', time: '' });
  };

  const handleEventClick = (event: Event, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      category: event.category,
      time: event.time || '',
    });
    setSelectedDate(new Date(event.dateISO));
    setShowEventModal(true);
  };

  const checkConflicts = (dateISO: string, time: string, excludeId?: string): Event[] => {
    if (!time) return [];
    return events.filter(
      event => event.dateISO === dateISO && event.time === time && (!excludeId || event.id !== excludeId)
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
        dateISO,
      });
      if (updated) {
        setEvents(events.map(e => (e.id === editingEvent.id ? updated : e)));
      }
    } else {
      const event = await createEvent(user.id, {
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || undefined,
        category: newEvent.category,
        time: newEvent.time || undefined,
        dateISO,
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
    return events
      .filter(event => event.dateISO === dateStr)
      .sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
  };

  const getSelectedDateEvents = () => (selectedDate ? getEventsForDate(selectedDate) : []);

  const getFilteredEvents = () => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(
      event =>
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

  const filteredEvents = getFilteredEvents();
  const selectedDateEvents = searchQuery.trim() ? filteredEvents : getSelectedDateEvents();
  const dateISO = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const timeConflicts = newEvent.time ? checkConflicts(dateISO, newEvent.time, editingEvent?.id) : [];

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white min-w-[160px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search events…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
          />
        </div>
      </div>

      <div className={`flex flex-col lg:flex-row ${isCompact ? 'gap-4' : 'gap-5'}`}>
        {/* Calendar grid */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Week header */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
            {weekDays.map(day => (
              <div key={day} className={`text-center ${isCompact ? 'py-2' : 'py-3'}`}>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  {isCompact ? day[0] : day}
                </span>
              </div>
            ))}
          </div>

          {/* Days */}
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
                  className={`border-r border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40'
                      : isCurrentDay
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/20'
                      : !isCurrentMonth
                      ? 'bg-slate-50/50 dark:bg-slate-900/50'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  } ${isCompact ? 'min-h-[56px] p-1' : 'min-h-[90px] p-2'}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleDateClick(day)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span
                      className={`text-xs font-semibold inline-flex items-center justify-center ${isCompact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full ${
                        isCurrentDay
                          ? 'bg-indigo-600 text-white'
                          : !isCurrentMonth
                          ? 'text-slate-300 dark:text-slate-600'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, isCompact ? 1 : 2).map(event => (
                      <div
                        key={event.id}
                        onClick={e => handleEventClick(event, e)}
                        className={`rounded-md text-white cursor-pointer hover:opacity-80 transition-opacity truncate ${getCategoryColor(event.category)} ${isCompact ? 'px-1 py-0.5 text-[10px]' : 'px-1.5 py-0.5 text-[11px]'}`}
                        title={event.title}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') handleEventClick(event, e);
                        }}
                      >
                        {event.time && <span className="font-semibold mr-0.5">{event.time}</span>}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > (isCompact ? 1 : 2) && (
                      <div className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium px-1">
                        +{dayEvents.length - (isCompact ? 1 : 2)} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className={`lg:w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200 dark:border-slate-800 flex flex-col ${isCompact ? 'p-4' : 'p-5'}`}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            {searchQuery.trim()
              ? `Results (${filteredEvents.length})`
              : selectedDate
              ? format(selectedDate, 'EEEE, MMM d')
              : 'Select a day'}
          </h3>

          {(selectedDate || searchQuery.trim()) && (
            <>
              {selectedDateEvents.length > 0 ? (
                <div className="flex-1 overflow-y-auto space-y-2">
                  {selectedDateEvents.map(event => (
                    <div
                      key={event.id}
                      className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getCategoryColor(event.category)}`} />
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">{event.title}</h4>
                        </div>
                        <div className="flex gap-0.5 flex-shrink-0 ml-2">
                          <button
                            onClick={() => handleEventClick(event, { stopPropagation: () => {} } as React.MouseEvent)}
                            className="p-1 text-slate-300 dark:text-slate-600 hover:text-indigo-500 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteEventHandler(event.id)}
                            className="p-1 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {event.time && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 ml-4">{event.time}</p>
                      )}
                      {event.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 ml-4 mt-0.5">{event.description}</p>
                      )}
                      <span className="ml-4 mt-1.5 inline-block text-[10px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full">
                        {getCategoryLabel(event.category)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <CalendarIcon className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">No events</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => handleDateClick(selectedDate)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer shadow-sm shadow-indigo-500/20"
              >
                <Plus className="h-4 w-4" />
                Add event
              </button>
            </>
          )}
        </div>
      </div>

      {/* Event Modal — bottom sheet on mobile, centred on sm+ */}
      {showEventModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end xs:items-center justify-center xs:p-4 z-50 pb-safe"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEventModal(false); }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-t-2xl xs:rounded-2xl w-full xs:max-w-md max-h-[92dvh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/20 sheet-enter xs:animate-none">
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-1 xs:hidden">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
            <div className="hidden xs:block h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-t-2xl" />
            <div className="p-5 xs:p-6">
              <div className="flex items-center justify-between mb-4 xs:mb-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingEvent ? 'Edit event' : 'New event'}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Date display */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                  <CalendarIcon className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                    className={inputClass}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Time <span className="font-normal text-slate-400 normal-case">(optional)</span>
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {timeConflicts.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      <span className="font-semibold">Conflict: </span>
                      {timeConflicts[0].title} is already at this time
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Category
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={e => setNewEvent({ ...newEvent, category: e.target.value as Event['category'] })}
                    className={inputClass}
                  >
                    {EVENT_CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                    Description <span className="font-normal text-slate-400 normal-case">(optional)</span>
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Add a note…"
                    rows={3}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {editingEvent ? (
                  <button
                    onClick={() => deleteEventHandler(editingEvent.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEvent}
                    disabled={!newEvent.title.trim()}
                    className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-lg transition-all duration-200 cursor-pointer shadow-sm shadow-indigo-500/20"
                  >
                    {editingEvent ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
