import React from 'react';
import WeeklyPlanner from '../components/WeeklyPlanner';
import ExportButton from '../components/ExportButton';
import { useState } from 'react';
import PrintView from '../components/PrintView';

const PlannerPage: React.FC = () => {
  const [printView, setPrintView] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weekly Planner</h1>
        <ExportButton onPrint={() => setPrintView(true)} label="Export" />
      </div>
      <WeeklyPlanner />
      {printView && <PrintView view="planner" onClose={() => setPrintView(false)} />}
    </>
  );
};

export default PlannerPage;
