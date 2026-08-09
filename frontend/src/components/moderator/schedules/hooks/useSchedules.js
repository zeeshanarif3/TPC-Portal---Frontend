import { useState } from 'react';
import schedulesApi from '../services/schedulesApi';

export default function useSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const [schedulesData, conflictsData] = await Promise.all([
        schedulesApi.getAllSchedules(),
        schedulesApi.getConflicts(),
      ]);
      setSchedules(schedulesData);
      setConflicts(conflictsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId) => {
    try {
      await schedulesApi.deleteSchedule(scheduleId);
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    } catch (err) {
      setError(err.message || 'Failed to delete schedule');
    }
  };

  const createSchedule = async (scheduleData) => {
    try {
      const newSchedule = await schedulesApi.createSchedule(scheduleData);
      setSchedules(prev => [...prev, newSchedule]);
      return newSchedule;
    } catch (err) {
      setError(err.message || 'Failed to create schedule');
      throw err;
    }
  };

  const updateSchedule = async (scheduleId, scheduleData) => {
    try {
      const updated = await schedulesApi.updateSchedule(scheduleId, scheduleData);
      setSchedules(prev => prev.map(s => s.id === scheduleId ? updated : s));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update schedule');
      throw err;
    }
  };

  const resolveConflict = async (conflictId) => {
    try {
      await schedulesApi.resolveConflict(conflictId);
      setConflicts(prev => prev.filter(c => c.id !== conflictId));
    } catch (err) {
      setError(err.message || 'Failed to resolve conflict');
    }
  };

  return {
    schedules,
    conflicts,
    loading,
    error,
    fetchSchedules,
    deleteSchedule,
    createSchedule,
    updateSchedule,
    resolveConflict,
  };
}