const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// const USE_MOCK = false; //flip this to true to use mock data . Set to false to use real API calls.
const USE_MOCK = true; //flip this to true to use mock data . Set to false to use real API calls.

const MOCK_ATTENDANCE = [
  { id: 'ATT001', date: '2026-06-13', time: '09:00', course: 'Python for Data Science', session: 'Spring 2025', headCount: '38 / 42', percentage: '90%' },
  { id: 'ATT002', date: '2026-06-13', time: '10:00', course: 'Full Stack Web Dev', session: 'Spring 2025', headCount: '35 / 38', percentage: '92%' },
  { id: 'ATT003', date: '2026-06-12', time: '14:00', course: 'Neural Networks 101', session: 'Spring 2025', headCount: '22 / 29', percentage: '76%' },
  { id: 'ATT004', date: '2026-06-12', time: '09:00', course: 'AWS Cloud Practitioner', session: 'Spring 2025', headCount: '46 / 55', percentage: '84%' },
  { id: 'ATT005', date: '2026-06-11', time: '11:00', course: 'Ethical Hacking Basics', session: 'Spring 2025', headCount: '28 / 44', percentage: '64%' },
];

const MOCK_STATS = {
  todayHeadcount: 73,
  sessionsToday: 2,
  weeklyAverage: 84,
  belowThreshold: 2,
};

const attendanceApi = {
  async getAllAttendance() {
    if (USE_MOCK) return MOCK_ATTENDANCE;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  async getAttendanceById(attendanceId) {
    if (USE_MOCK) return MOCK_ATTENDANCE.find(a => a.id === attendanceId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance/${attendanceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  async createAttendance(attendanceData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(attendanceData),
      });
      if (!response.ok) throw new Error('Failed to create attendance');
      return await response.json();
    } catch (error) {
      console.error('Error creating attendance:', error);
      throw error;
    }
  },

  async updateAttendance(attendanceId, attendanceData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance/${attendanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(attendanceData),
      });
      if (!response.ok) throw new Error('Failed to update attendance');
      return await response.json();
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  },

  async deleteAttendance(attendanceId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance/${attendanceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete attendance');
      return await response.json();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      throw error;
    }
  },

  async getStats() {
    if (USE_MOCK) return MOCK_STATS;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  async getAttendanceBySession(sessionId) {
    if (USE_MOCK) return MOCK_ATTENDANCE.filter(a => a.session);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  async getAttendanceByDate(date) {
    if (USE_MOCK) return MOCK_ATTENDANCE.filter(a => a.date === date);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance/date/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  async bulkCreateAttendance(attendanceList) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(attendanceList),
      });
      if (!response.ok) throw new Error('Failed to create attendance');
      return await response.json();
    } catch (error) {
      console.error('Error creating attendance:', error);
      throw error;
    }
  },
};

export default attendanceApi;