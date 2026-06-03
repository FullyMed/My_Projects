import React, { useState } from 'react';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import WeeklyPlanner from '../components/WeeklyPlanner';
import ExportButton from '../components/ExportButton';
import PrintView from '../components/PrintView';

const getWeekKey = (date: Date) => {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
};

const PlannerPage: React.FC = () => {
  const [printView, setPrintView] = useState(false);
  // Initialise to the current ISO week so PrintView is correct even before
  // the user navigates to a different week.
  const [currentWeekKey, setCurrentWeekKey] = useState(() => getWeekKey(new Date()));

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl xs:text-3xl font-bold text-slate-900 dark:text-white">Weekly Planner</h1>
        <ExportButton onPrint={() => setPrintView(true)} label="Export" />
      </div>
      <WeeklyPlanner onWeekChange={setCurrentWeekKey} />
      {printView && (
        <PrintView
          view="planner"
          weekKey={currentWeekKey}
          onClose={() => setPrintView(false)}
        />
      )}
    </>
  );
};

export default PlannerPage;
