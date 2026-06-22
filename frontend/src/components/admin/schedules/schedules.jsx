import { useState, useEffect } from 'react';
import SchedulesTable from './components/SchedulesTable';
import SchedulesCalendar from './components/SchedulesCalendar';
import ConflictAlert from './components/ConflictAlert';
import useSchedules from './hooks/useSchedules';

import'./schedules.css'


export default function SchedulesPage() {
  const { schedules, conflicts, loading, error, fetchSchedules, deleteSchedule, resolveConflict } = useSchedules();
  const [view, setView] = useState('table');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleResolveConflict = async (conflictId) => {
    await resolveConflict(conflictId);
    fetchSchedules();
  };

  return (
    <div className="Schedulees-page">
      {/* Header */}
      <div className="Schedulees-header">
        <div>
          <h1>Schedules</h1>
          <p>Timetables and slot management</p>
        </div>
        <div className="Schedulees-controls">
          <button 
            className={`btn-view-toggle ${view === 'table' ? 'active' : ''}`}
            onClick={() => setView('table')}
          >
            Table
          </button>
          <button 
            className={`btn-view-toggle ${view === 'calendar' ? 'active' : ''}`}
            onClick={() => setView('calendar')}
          >
            Calendar
          </button>
          <button className="btn-add-slot" onClick={() => window.location.href = '/schedules/new'}>
            + Add Slot
          </button>
        </div>
      </div>

      {/* Conflict Alert */}
      {conflicts.length > 0 && (
        <ConflictAlert 
          conflicts={conflicts} 
          onResolve={handleResolveConflict}
        />
      )}

      {/* Content */}
      {loading && <p className="loading">Loading schedules...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <>
          {view === 'table' ? (
            <SchedulesTable
              schedules={schedules}
              onDelete={deleteSchedule}
              onRefresh={fetchSchedules}
            />
          ) : (
            <SchedulesCalendar
              schedules={schedules}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onDelete={deleteSchedule}
              onRefresh={fetchSchedules}
            />
          )}
        </>
      )}
    </div>
  );
}