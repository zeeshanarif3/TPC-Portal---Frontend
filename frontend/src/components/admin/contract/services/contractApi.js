const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const USE_MOCK = true; //flip this to true to use mock data for testing purposes. Set to false to use real API calls.

const MOCK_CONTRACTS = [
  { id: 'CTR001', trainer: 'Priya Sharma', college: 'Delhi Institute of Technology', session: 'Spring 2025', status: 'Active', startDate: '2025-01-10', endDate: '2025-06-30' },
  { id: 'CTR002', trainer: 'Rahul Mehta', college: 'Amity University Noida', session: 'Spring 2025', status: 'Active', startDate: '2025-01-15', endDate: '2025-06-30' },
  { id: 'CTR003', trainer: 'Anjali Verma', college: 'Delhi Institute of Technology', session: 'Spring 2025', status: 'Expiring Soon', startDate: '2025-01-10', endDate: '2025-07-15' },
  { id: 'CTR004', trainer: 'Vikram Singh', college: 'Punjab Engineering College', session: 'Fall 2024', status: 'Expired', startDate: '2024-07-01', endDate: '2024-12-31' },
  { id: 'CTR005', trainer: 'Neha Gupta', college: 'Lovely Professional University', session: 'Spring 2025', status: 'Active', startDate: '2025-02-01', endDate: '2025-07-31' },
];

const contractsApi = {
  async getAllContracts() {
    if (USE_MOCK) return MOCK_CONTRACTS;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contracts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch contracts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  },

  async getContractById(contractId) {
    if (USE_MOCK) return MOCK_CONTRACTS.find(c => c.id === contractId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch contract');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contract:', error);
      throw error;
    }
  },

  async createContract(contractData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(contractData),
      });
      if (!response.ok) throw new Error('Failed to create contract');
      return await response.json();
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  },

  async updateContract(contractId, contractData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contracts/${contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(contractData),
      });
      if (!response.ok) throw new Error('Failed to update contract');
      return await response.json();
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  },

  async deleteContract(contractId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contracts/${contractId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete contract');
      return await response.json();
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  },

  async endContract(contractId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contracts/${contractId}/end`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ endDate: new Date().toISOString().split('T')[0] }),
      });
      if (!response.ok) throw new Error('Failed to end contract');
      return await response.json();
    } catch (error) {
      console.error('Error ending contract:', error);
      throw error;
    }
  },

  async getContractsByTrainer(trainerId) {
    if (USE_MOCK) return MOCK_CONTRACTS.filter(c => c.trainer);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contracts/trainer/${trainerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch contracts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  },

  async getContractsByCollege(collegeId) {
    if (USE_MOCK) return MOCK_CONTRACTS.filter(c => c.college);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contracts/college/${collegeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch contracts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  },
};

export default contractsApi;