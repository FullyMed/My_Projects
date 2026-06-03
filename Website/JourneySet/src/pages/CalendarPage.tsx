import React from 'react';
import EventCalendar from '../components/EventCalendar';
import ExportButton from '../components/ExportButton';
import { useState } from 'react';
import PrintView from '../components/PrintView';

const CalendarPage: React.FC = () => {
  const [printView, setPrintView] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl xs:text-3xl font-bold text-gray-900 dark:text-white">Event Calendar</h1>
        <ExportButton onPrint={() => setPrintView(true)} label="Export" />
      </div>
      <EventCalendar />
      {printView && <PrintView view="calendar" onClose={() => setPrintView(false)} />}
    </>
  );
};

export default CalendarPage;
