const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';



// const USE_MOCK = false; //flip this to true to use mock data . Set to false to use real API calls.
const USE_MOCK = true; //flip this to true to use mock data . Set to false to use real API calls.

const MOCK_TRAINERS = [
  { id: 'TRN001', name: 'Priya Sharma', subject: 'Data Science', colleges: 2, contractStatus: 'Active', currentSession: 'Spring 2025' },
  { id: 'TRN002', name: 'Rahul Mehta', subject: 'Web Development', colleges: 1, contractStatus: 'Active', currentSession: 'Spring 2025' },
  { id: 'TRN003', name: 'Anjali Verma', subject: 'Machine Learning', colleges: 2, contractStatus: 'Expiring Soon', currentSession: 'Spring 2025' },
  { id: 'TRN004', name: 'Vikram Singh', subject: 'Cybersecurity', colleges: 2, contractStatus: 'Expired', currentSession: null },
  { id: 'TRN005', name: 'Neha Gupta', subject: 'Cloud Computing', colleges: 2, contractStatus: 'Active', currentSession: 'Spring 2025' },
  { id: 'TRN006', name: 'Arjun Patel', subject: 'DevOps', colleges: 1, contractStatus: 'Active', currentSession: 'Spring 2025' },
];

const trainersApi = {
  async getAllTrainers() {
    if (USE_MOCK) return MOCK_TRAINERS;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/trainers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch trainers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching trainers:', error);
      throw error;
    }
  },

  async getTrainerById(trainerId) {
    if (USE_MOCK) return MOCK_TRAINERS.find(t => t.id === trainerId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/trainers/${trainerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch trainer');
      return await response.json();
    } catch (error) {
      console.error('Error fetching trainer:', error);
      throw error;
    }
  },

  async createTrainer(trainerData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/trainers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(trainerData),
      });
      if (!response.ok) throw new Error('Failed to create trainer');
      return await response.json();
    } catch (error) {
      console.error('Error creating trainer:', error);
      throw error;
    }
  },

  async updateTrainer(trainerId, trainerData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/trainers/${trainerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(trainerData),
      });
      if (!response.ok) throw new Error('Failed to update trainer');
      return await response.json();
    } catch (error) {
      console.error('Error updating trainer:', error);
      throw error;
    }
  },

  async deleteTrainer(trainerId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/trainers/${trainerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete trainer');
      return await response.json();
    } catch (error) {
      console.error('Error deleting trainer:', error);
      throw error;
    }
  },

  async assignContract(trainerId, contractData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/trainers/${trainerId}/assign-contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(contractData),
      });
      if (!response.ok) throw new Error('Failed to assign contract');
      return await response.json();
    } catch (error) {
      console.error('Error assigning contract:', error);
      throw error;
    }
  },

  async getTrainerByCollege(collegeId) {
    if (USE_MOCK) return MOCK_TRAINERS.filter(t => t.colleges > 0);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/trainers/college/${collegeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch trainers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching trainers:', error);
      throw error;
    }
  },
};

export default trainersApi;