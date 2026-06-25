const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';


const USE_MOCK = true; //flip this to true to use mock data for testing purposes. Set to false to use real API calls.

const MOCK_COLLEGES = [
  { id: 'COL001', name: 'Delhi Institute of Technology', courses: 8, trainers: 5, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL002', name: 'Punjab Engineering College', courses: 12, trainers: 7, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL003', name: 'Amity University Noida', courses: 6, trainers: 4, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL004', name: 'Chandigarh University', courses: 10, trainers: 6, activeSession: null, status: 'Inactive' },
  { id: 'COL005', name: 'Lovely Professional University', courses: 14, trainers: 9, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL006', name: 'Delhi Institute of Technology', courses: 8, trainers: 5, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL007', name: 'Punjab Engineering College', courses: 12, trainers: 7, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL0031', name: 'Amity University Noida', courses: 6, trainers: 4, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL0042', name: 'Chandigarh University', courses: 10, trainers: 6, activeSession: null, status: 'Inactive' },
  { id: 'COL0053', name: 'Lovely Professional University', courses: 14, trainers: 9, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL0014', name: 'Delhi Institute of Technology', courses: 8, trainers: 5, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL0025', name: 'Punjab Engineering College', courses: 12, trainers: 7, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL0036', name: 'Amity University Noida', courses: 6, trainers: 4, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL0047', name: 'Chandigarh University', courses: 10, trainers: 6, activeSession: null, status: 'Inactive' },
  { id: 'COL0058', name: 'Lovely Professional University', courses: 14, trainers: 9, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL0019', name: 'Delhi Institute of Technology', courses: 8, trainers: 5, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL0021', name: 'Punjab Engineering College', courses: 12, trainers: 7, activeSession: 'Spring 2025', status: 'Active' },
  { id: 'COL0032', name: 'Amity University Noida', courses: 6, trainers: 4, activeSession: 'Spring 2025', status: 'Active' }

];

const collegeApi = {
  async getAllColleges(token) {
    if (USE_MOCK) return MOCK_COLLEGES;
    try {
      // const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/colleges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch colleges');
      return await response.json();
    } catch (error) {
      console.error('Error fetching colleges:', error);
      throw error;
    }
  },

  async getCollegeById(collegeId , token) {
    if (USE_MOCK) return MOCK_COLLEGES.find(c => c.id === collegeId);
    try {
      // const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/colleges/${collegeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch college');
      return await response.json();
    } catch (error) {
      console.error('Error fetching college:', error);
      throw error;
    }
  },

  async createCollege(collegeData , token) {
    try {
      const response = await fetch(`${API_BASE}/colleges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(collegeData),
      });
      if (!response.ok) throw new Error('Failed to create college');
      return await response.json();
    } catch (error) {
      console.error('Error creating college:', error);
      throw error;
    }
  },

  async updateCollege(collegeId, collegeData , token) {
    try {
      // const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/colleges/${collegeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(collegeData),
      });
      if (!response.ok) throw new Error('Failed to update college');
      return await response.json();
    } catch (error) {
      console.error('Error updating college:', error);
      throw error;
    }
  },

  async deleteCollege(collegeId , token) {
    try {
      // const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/colleges/${collegeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete college');
      return await response.json();
    } catch (error) {
      console.error('Error deleting college:', error);
      throw error;
    }
  },

  async archiveCollege(collegeId , token) {
    try {
      // const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/colleges/${collegeId}/archive`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to archive college');
      return await response.json();
    } catch (error) {
      console.error('Error archiving college:', error);
      throw error;
    }
  },
};

export default collegeApi;