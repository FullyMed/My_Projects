import React, { Suspense, lazy, useState } from 'react';
import GoalTracker from '../components/GoalTracker';
import ExportButton from '../components/ExportButton';
import { usePageMeta } from '../hooks/usePageMeta';

// Only needed on Export, so it's split into its own chunk.
const PrintView = lazy(() => import('../components/PrintView'));

const GoalsPage: React.FC = () => {
  usePageMeta(
    'Goal Tracker | JourneySet',
    "Set targets, track progress, and hit your goals with JourneySet's visual Goal Tracker."
  );
  const [printView, setPrintView] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl xs:text-3xl font-bold text-slate-900 dark:text-white">Goal Tracker</h1>
        <ExportButton onPrint={() => setPrintView(true)} label="Export" />
      </div>
      <GoalTracker />
      {printView && (
        <Suspense fallback={null}>
          <PrintView view="goals" onClose={() => setPrintView(false)} />
        </Suspense>
      )}
    </>
  );
};

export default GoalsPage;
