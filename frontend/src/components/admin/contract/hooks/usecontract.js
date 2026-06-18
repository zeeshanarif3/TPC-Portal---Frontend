import { useState } from 'react';
import contractsApi from '../services/contractApi';

export default function useContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contractsApi.getAllContracts();
      setContracts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  const deleteContract = async (contractId) => {
    try {
      await contractsApi.deleteContract(contractId);
      setContracts(prev => prev.filter(c => c.id !== contractId));
    } catch (err) {
      setError(err.message || 'Failed to delete contract');
    }
  };

  const endContract = async (contractId) => {
    try {
      const updated = await contractsApi.endContract(contractId);
      setContracts(prev => prev.map(c => c.id === contractId ? updated : c));
    } catch (err) {
      setError(err.message || 'Failed to end contract');
    }
  };

  const createContract = async (contractData) => {
    try {
      const newContract = await contractsApi.createContract(contractData);
      setContracts(prev => [...prev, newContract]);
      return newContract;
    } catch (err) {
      setError(err.message || 'Failed to create contract');
      throw err;
    }
  };

  const updateContract = async (contractId, contractData) => {
    try {
      const updated = await contractsApi.updateContract(contractId, contractData);
      setContracts(prev => prev.map(c => c.id === contractId ? updated : c));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update contract');
      throw err;
    }
  };

  const getContractsByTrainer = async (trainerId) => {
    try {
      return await contractsApi.getContractsByTrainer(trainerId);
    } catch (err) {
      setError(err.message || 'Failed to fetch contracts');
      throw err;
    }
  };

  const getContractsByCollege = async (collegeId) => {
    try {
      return await contractsApi.getContractsByCollege(collegeId);
    } catch (err) {
      setError(err.message || 'Failed to fetch contracts');
      throw err;
    }
  };

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    deleteContract,
    endContract,
    createContract,
    updateContract,
    getContractsByTrainer,
    getContractsByCollege,
  };
}