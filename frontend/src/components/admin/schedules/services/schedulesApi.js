const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// const USE_MOCK = false; //flip this to true to use mock data . Set to false to use real API calls.
const USE_MOCK = true; //flip this to true to use mock data . Set to false to use real API calls.

const MOCK_SCHEDULES = [
  { id: 'SCH001', course: 'Python for Data Science', trainer: 'Priya Sharma', day: 'Monday', timeSlot: '09:00 - 11:00', session: 'Spring 2025', college: 'DIT' },
  { id: 'SCH002', course: 'Full Stack Web Dev', trainer: 'Rahul Mehta', day: 'Tuesday', timeSlot: '10:00 - 12:00', session: 'Spring 2025', college: 'AUN' },
  { id: 'SCH003', course: 'Neural Networks 101', trainer: 'Anjali Verma', day: 'Wednesday', timeSlot: '14:00 - 16:00', session: 'Spring 2025', college: 'DIT' },
  { id: 'SCH004', course: 'AWS Cloud Practitioner', trainer: 'Neha Gupta', day: 'Thursday', timeSlot: '09:00 - 11:00', session: 'Spring 2025', college: 'LPU' },
  { id: 'SCH005', course: 'Ethical Hacking Basics', trainer: 'Vikram Singh', day: 'Friday', timeSlot: '11:00 - 13:00', session: 'Spring 2025', college: 'PEC' },
  { id: 'SCH006', course: 'Docker & Kubernetes', trainer: 'Arjun Patel', day: 'Monday', timeSlot: '13:00 - 15:00', session: 'Spring 2025', college: 'DIT' },
];

const MOCK_CONFLICTS = [];

const schedulesApi = {
  async getAllSchedules() {
    if (USE_MOCK) return MOCK_SCHEDULES;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch schedules');
      return await response.json();
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },

  async getScheduleById(scheduleId) {
    if (USE_MOCK) return MOCK_SCHEDULES.find(s => s.id === scheduleId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/schedules/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch schedule');
      return await response.json();
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  },

  async createSchedule(scheduleData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(scheduleData),
      });
      if (!response.ok) throw new Error('Failed to create schedule');
      return await response.json();
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  async updateSchedule(scheduleId, scheduleData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(scheduleData),
      });
      if (!response.ok) throw new Error('Failed to update schedule');
      return await response.json();
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  },

  async deleteSchedule(scheduleId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete schedule');
      return await response.json();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  },

  async getConflicts() {
    if (USE_MOCK) return MOCK_CONFLICTS;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/schedules/conflicts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch conflicts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching conflicts:', error);
      throw error;
    }
  },

  async resolveConflict(conflictId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/schedules/conflicts/${conflictId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to resolve conflict');
      return await response.json();
    } catch (error) {
      console.error('Error resolving conflict:', error);
      throw error;
    }
  },
};

export default schedulesApi;