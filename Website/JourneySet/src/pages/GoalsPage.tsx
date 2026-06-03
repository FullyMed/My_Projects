import React from 'react';
import GoalTracker from '../components/GoalTracker';
import ExportButton from '../components/ExportButton';
import { useState } from 'react';
import PrintView from '../components/PrintView';

const GoalsPage: React.FC = () => {
  const [printView, setPrintView] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goal Tracker</h1>
        <ExportButton onPrint={() => setPrintView(true)} label="Export" />
      </div>
      <GoalTracker />
      {printView && <PrintView view="goals" onClose={() => setPrintView(false)} />}
    </>
  );
};

export default GoalsPage;
