import { useState } from 'react';
import sessionsApi from '../services/sessionsApi';

export default function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionsApi.getAllSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await sessionsApi.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      setError(err.message || 'Failed to delete session');
    }
  };

  const createSession = async (sessionData) => {
    try {
      const newSession = await sessionsApi.createSession(sessionData);
      setSessions(prev => [...prev, newSession]);
      return newSession;
    } catch (err) {
      setError(err.message || 'Failed to create session');
      throw err;
    }
  };

  const updateSession = async (sessionId, sessionData) => {
    try {
      const updated = await sessionsApi.updateSession(sessionId, sessionData);
      setSessions(prev => prev.map(s => s.id === sessionId ? updated : s));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update session');
      throw err;
    }
  };

  const completeSession = async (sessionId) => {
    try {
      const updated = await sessionsApi.completeSession(sessionId);
      setSessions(prev => prev.map(s => s.id === sessionId ? updated : s));
    } catch (err) {
      setError(err.message || 'Failed to complete session');
    }
  };

  const getSessionsByCollege = async (collegeId) => {
    try {
      return await sessionsApi.getSessionsByCollege(collegeId);
    } catch (err) {
      setError(err.message || 'Failed to fetch sessions');
      throw err;
    }
  };

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    deleteSession,
    createSession,
    updateSession,
    completeSession,
    getSessionsByCollege,
  };
}