import React, { Suspense, lazy, useState } from 'react';
import EventCalendar from '../components/EventCalendar';
import ExportButton from '../components/ExportButton';
import { usePageMeta } from '../hooks/usePageMeta';

// Only needed on Export, so it's split into its own chunk.
const PrintView = lazy(() => import('../components/PrintView'));

const CalendarPage: React.FC = () => {
  usePageMeta(
    'Event Calendar | JourneySet',
    "Manage appointments and events with conflict detection in JourneySet's monthly Event Calendar."
  );
  const [printView, setPrintView] = useState(false);
  // Month currently shown in EventCalendar, so Export prints that month.
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl xs:text-3xl font-bold text-slate-900 dark:text-white">Event Calendar</h1>
        <ExportButton onPrint={() => setPrintView(true)} label="Export" />
      </div>
      <EventCalendar onMonthChange={setVisibleMonth} />
      {printView && (
        <Suspense fallback={null}>
          <PrintView view="calendar" month={visibleMonth} onClose={() => setPrintView(false)} />
        </Suspense>
      )}
    </>
  );
};

export default CalendarPage;
