const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
// const USE_MOCK = false; //flip this to true to use mock data . Set to false to use real API calls.
const USE_MOCK = true; //flip this to true to use mock data . Set to false to use real API calls.


const MOCK_SESSIONS = [
  { id: 'SES001', college: 'Delhi Institute of Technology', startDate: '2025-01-10', endDate: '2025-06-30', courses: 8, status: 'Active' },
  { id: 'SES002', college: 'Punjab Engineering College', startDate: '2025-01-15', endDate: '2025-06-30', courses: 12, status: 'Active' },
  { id: 'SES003', college: 'Amity University Noida', startDate: '2025-02-01', endDate: '2025-07-15', courses: 6, status: 'Active' },
  { id: 'SES004', college: 'Chandigarh University', startDate: '2024-07-01', endDate: '2024-12-31', courses: 10, status: 'Completed' },
  { id: 'SES005', college: 'Lovely Professional University', startDate: '2025-02-01', endDate: '2025-07-31', courses: 14, status: 'Active' },
];

const sessionsApi = {
  async getAllSessions() {
    if (USE_MOCK) return MOCK_SESSIONS;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  async getSessionById(sessionId) {
    if (USE_MOCK) return MOCK_SESSIONS.find(s => s.id === sessionId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch session');
      return await response.json();
    } catch (error) {
      console.error('Error fetching session:', error);
      throw error;
    }
  },

  async createSession(sessionData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(sessionData),
      });
      if (!response.ok) throw new Error('Failed to create session');
      return await response.json();
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  async updateSession(sessionId, sessionData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(sessionData),
      });
      if (!response.ok) throw new Error('Failed to update session');
      return await response.json();
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  async deleteSession(sessionId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete session');
      return await response.json();
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  async getSessionsByCollege(collegeId) {
    if (USE_MOCK) return MOCK_SESSIONS.filter(s => s.college);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/sessions/college/${collegeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  async completeSession(sessionId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'Completed' }),
      });
      if (!response.ok) throw new Error('Failed to complete session');
      return await response.json();
    } catch (error) {
      console.error('Error completing session:', error);
      throw error;
    }
  },
};

export default sessionsApi;