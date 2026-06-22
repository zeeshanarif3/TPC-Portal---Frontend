import { useState } from 'react';
import attendanceApi from '../services/attendanceApi';

export default function useAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    todayHeadcount: 0,
    sessionsToday: 0,
    weeklyAverage: 0,
    belowThreshold: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const [attendanceData, statsData] = await Promise.all([
        attendanceApi.getAllAttendance(),
        attendanceApi.getStats(),
      ]);
      setAttendance(attendanceData);
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const deleteAttendance = async (attendanceId) => {
    try {
      await attendanceApi.deleteAttendance(attendanceId);
      setAttendance(prev => prev.filter(a => a.id !== attendanceId));
    } catch (err) {
      setError(err.message || 'Failed to delete attendance');
    }
  };

  const createAttendance = async (attendanceData) => {
    try {
      const newAttendance = await attendanceApi.createAttendance(attendanceData);
      setAttendance(prev => [...prev, newAttendance]);
      return newAttendance;
    } catch (err) {
      setError(err.message || 'Failed to create attendance');
      throw err;
    }
  };

  const updateAttendance = async (attendanceId, attendanceData) => {
    try {
      const updated = await attendanceApi.updateAttendance(attendanceId, attendanceData);
      setAttendance(prev => prev.map(a => a.id === attendanceId ? updated : a));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update attendance');
      throw err;
    }
  };

  const bulkCreateAttendance = async (attendanceList) => {
    try {
      const created = await attendanceApi.bulkCreateAttendance(attendanceList);
      setAttendance(prev => [...prev, ...created]);
      return created;
    } catch (err) {
      setError(err.message || 'Failed to create attendance');
      throw err;
    }
  };

  const getAttendanceBySession = async (sessionId) => {
    try {
      return await attendanceApi.getAttendanceBySession(sessionId);
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance');
      throw err;
    }
  };

  const getAttendanceByDate = async (date) => {
    try {
      return await attendanceApi.getAttendanceByDate(date);
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance');
      throw err;
    }
  };

  return {
    attendance,
    stats,
    loading,
    error,
    fetchAttendance,
    deleteAttendance,
    createAttendance,
    updateAttendance,
    bulkCreateAttendance,
    getAttendanceBySession,
    getAttendanceByDate,
  };
}