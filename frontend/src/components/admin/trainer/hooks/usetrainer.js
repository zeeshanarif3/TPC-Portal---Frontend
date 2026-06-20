import { useState } from 'react';
import trainersApi from '../services/trainerApi';
export default function useTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrainers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainersApi.getAllTrainers();
      setTrainers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch trainers');
    } finally {
      setLoading(false);
    }
  };

  const deleteTrainer = async (trainerId) => {
    try {
      await trainersApi.deleteTrainer(trainerId);
      setTrainers(prev => prev.filter(t => t.id !== trainerId));
    } catch (err) {
      setError(err.message || 'Failed to delete trainer');
    }
  };

  const createTrainer = async (trainerData) => {
    try {
      const newTrainer = await trainersApi.createTrainer(trainerData);
      setTrainers(prev => [...prev, newTrainer]);
      return newTrainer;
    } catch (err) {
      setError(err.message || 'Failed to create trainer');
      throw err;
    }
  };

  const updateTrainer = async (trainerId, trainerData) => {
    try {
      const updated = await trainersApi.updateTrainer(trainerId, trainerData);
      setTrainers(prev => prev.map(t => t.id === trainerId ? updated : t));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update trainer');
      throw err;
    }
  };

  const assignContract = async (trainerId, contractData) => {
    try {
      const updated = await trainersApi.assignContract(trainerId, contractData);
      setTrainers(prev => prev.map(t => t.id === trainerId ? updated : t));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to assign contract');
      throw err;
    }
  };

  const getTrainerByCollege = async (collegeId) => {
    try {
      return await trainersApi.getTrainerByCollege(collegeId);
    } catch (err) {
      setError(err.message || 'Failed to fetch trainers');
      throw err;
    }
  };

  return {
    trainers,
    loading,
    error,
    fetchTrainers,
    deleteTrainer,
    createTrainer,
    updateTrainer,
    assignContract,
    getTrainerByCollege,
  };
}