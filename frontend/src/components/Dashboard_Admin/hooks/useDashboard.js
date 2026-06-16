// useDashboard.js
import { useState, useEffect, useCallback } from 'react';
// import {
//   fetchDashboardStats,
//   fetchColleges,
//   fetchTrainers,
//   fetchUpcomingSchedule,
//   fetchAttendanceChart,
//   fetchSubjectDistribution,
//   fetchContractExpiry,
// } from '../services/dashboardapi';
import { 
  fetchDashboardStats,
  fetchColleges,
  fetchTrainers,
  fetchUpcomingSchedule,
  fetchAttendanceChart,
  fetchSubjectDistribution,
  fetchContractExpiry
} from '../services/dashboardapi';

// ─── Mock data (used until real API is wired up) ──────────────────────────────

const MOCK_COLLEGES = [
  { id: 'aup', label: 'AUP' },
  { id: 'thapar', label: 'Thapar' },
  { id: 'nit', label: 'NIT Jalandhar' },
];

const MOCK_STATS = {
  totalTrainers: 24,
  activeTrainers: 24,
  totalColleges: 3,
  activeSessions: 14,
  sessionsStartingThisWeek: 3,
};

const MOCK_TRAINERS = [
  { id: 1, name: 'Rahul Kumar',  subject: 'Data Science', contract: 'C-001', sessions: 12, status: 'Active' },
  { id: 2, name: 'Priya Sharma', subject: 'Web Dev',      contract: 'C-002', sessions: 9,  status: 'Active' },
  { id: 3, name: 'Arjun Mehta',  subject: 'ML/AI',        contract: 'C-003', sessions: 7,  status: 'Pending' },
  { id: 4, name: 'Neha Patel',   subject: 'UI/UX',        contract: 'C-004', sessions: 5,  status: 'Active' },
];

const MOCK_SCHEDULE = [
  { id: 1, trainer: 'Rahul Kumar',  course: 'DS-101', day: 'Mon', time: '09:00–11:00', status: 'Confirmed' },
  { id: 2, trainer: 'Priya Sharma', course: 'WD-204', day: 'Mon', time: '11:30–13:30', status: 'Confirmed' },
  { id: 3, trainer: 'Arjun Mehta',  course: 'ML-301', day: 'Tue', time: '09:00–12:00', status: 'Pending' },
  { id: 4, trainer: 'Neha Patel',   course: 'UX-102', day: 'Wed', time: '14:00–16:00', status: 'Confirmed' },
];

const MOCK_ATTENDANCE = [
  { day: 'Mon', value: 60 },
  { day: 'Tue', value: 80 },
  { day: 'Wed', value: 55 },
  { day: 'Thu', value: 90 },
  { day: 'Fri', value: 70 },
  { day: 'Sat', value: 40 },
  { day: 'Sun', value: 30 },
];

const MOCK_SUBJECT_DISTRIBUTION = [
  { subject: 'Data Science', count: 8, color: '#6C8EF5' },
  { subject: 'Web Dev',      count: 5, color: '#4CD9A0' },
  { subject: 'ML/AI',        count: 4, color: '#F5A623' },
  { subject: 'UI/UX',        count: 3, color: '#A78BFA' },
  { subject: 'DevOps',       count: 2, color: '#F97316' },
];

const MOCK_CONTRACT_EXPIRY = [
  { id: 1, name: 'Arjun Mehta',  expiresLabel: 'Expires Jul 15', daysLeft: 12, urgency: 'high' },
  { id: 2, name: 'Sana Iqbal',   expiresLabel: 'Expires Jul 22', daysLeft: 19, urgency: 'medium' },
  { id: 3, name: 'Dev Anand',    expiresLabel: 'Expires Aug 1',  daysLeft: 29, urgency: 'low' },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

const USE_MOCK = true; // flip to false when real API is ready

export function useDashboard() {
  const [selectedCollege, setSelectedCollege] = useState('aup');
  const [colleges, setColleges]               = useState([]);
  const [stats, setStats]                     = useState(null);
  const [trainers, setTrainers]               = useState([]);
  const [schedule, setSchedule]               = useState([]);
  const [attendance, setAttendance]           = useState([]);
  const [subjectDist, setSubjectDist]         = useState([]);
  const [contractExpiry, setContractExpiry]   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);

  // Load colleges once
  useEffect(() => {
    if (USE_MOCK) { setColleges(MOCK_COLLEGES); return; }
    fetchColleges().then(setColleges).catch(setError);
  }, []);

  // Reload everything when selected college changes
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        // Simulate async delay
        await new Promise(r => setTimeout(r, 300));
        setStats(MOCK_STATS);
        setTrainers(MOCK_TRAINERS);
        setSchedule(MOCK_SCHEDULE);
        setAttendance(MOCK_ATTENDANCE);
        setSubjectDist(MOCK_SUBJECT_DISTRIBUTION);
        setContractExpiry(MOCK_CONTRACT_EXPIRY);
      } else {
        const [s, t, sc, a, sd, ce] = await Promise.all([
          fetchDashboardStats(selectedCollege),
          fetchTrainers(selectedCollege),
          fetchUpcomingSchedule(selectedCollege),
          fetchAttendanceChart(selectedCollege),
          fetchSubjectDistribution(selectedCollege),
          fetchContractExpiry(selectedCollege),
        ]);
        setStats(s);
        setTrainers(t);
        setSchedule(sc);
        setAttendance(a);
        setSubjectDist(sd);
        setContractExpiry(ce);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [selectedCollege]);

  useEffect(() => { load(); }, [load]);

  return {

    
    selectedCollege,
    setSelectedCollege,
    colleges,
    stats,
    trainers,
    schedule,
    attendance,
    subjectDist,
    contractExpiry,
    loading,
    error,
    refresh: load,
    
  };
}