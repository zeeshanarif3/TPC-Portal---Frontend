import { useState } from 'react';
import collegeApi from '../services/colledgeApi';

export default function useCollege(token) {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchColleges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await collegeApi.getAllColleges(token);
      setColleges(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch colleges');
    } finally {
      setLoading(false);
    }
  };

  const deleteCollege = async (collegeId) => {
    try {
      await collegeApi.deleteCollege(collegeId,token);
      setColleges(prev => prev.filter(c => c.id !== collegeId));
    } catch (err) {
      setError(err.message || 'Failed to delete college');
    }
  };

  const archiveCollege = async (collegeId) => {
    try {
      await collegeApi.archiveCollege(collegeId,token);
      setColleges(prev =>
        prev.map(c => c.id === collegeId ? { ...c, status: 'Inactive' } : c)
      );
    } catch (err) {
      setError(err.message || 'Failed to archive college');
    }
  };

  const createCollege = async (collegeData) => {
    try {
      const newCollege = await collegeApi.createCollege(collegeData ,token);
      setColleges(prev => [...prev, newCollege]);
      return newCollege;
    } catch (err) {
      setError(err.message || 'Failed to create college');
      throw err;
    }
  };

  const updateCollege = async (collegeId, collegeData) => {
    try {
      const updated = await collegeApi.updateCollege(collegeId, collegeData , token);
      setColleges(prev => prev.map(c => c.id === collegeId ? updated : c));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update college');
      throw err;
    }
  };

  return {
    colleges,
    loading,
    error,
    fetchColleges,
    deleteCollege,
    archiveCollege,
    createCollege,
    updateCollege,
  };
}