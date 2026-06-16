// dashboardApi.js
// Mock API layer — replace base URL and endpoints with your actual backend

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchDashboardStats(collegeId) {
  const res = await fetch(`${BASE_URL}/dashboard/stats?college=${collegeId}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchColleges() {
  const res = await fetch(`${BASE_URL}/colleges`);
  if (!res.ok) throw new Error('Failed to fetch colleges');
  return res.json();
}

export async function fetchTrainers(collegeId) {
  const res = await fetch(`${BASE_URL}/trainers?college=${collegeId}`);
  if (!res.ok) throw new Error('Failed to fetch trainers');
  return res.json();
}

export async function fetchUpcomingSchedule(collegeId) {
  const res = await fetch(`${BASE_URL}/schedule/upcoming?college=${collegeId}`);
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}

export async function fetchAttendanceChart(collegeId) {
  const res = await fetch(`${BASE_URL}/attendance/chart?college=${collegeId}`);
  if (!res.ok) throw new Error('Failed to fetch attendance');
  return res.json();
}

export async function fetchSubjectDistribution(collegeId) {
  const res = await fetch(`${BASE_URL}/subjects/distribution?college=${collegeId}`);
  if (!res.ok) throw new Error('Failed to fetch subject distribution');
  return res.json();
}

export async function fetchContractExpiry(collegeId) {
  const res = await fetch(`${BASE_URL}/contracts/expiry?college=${collegeId}`);
  if (!res.ok) throw new Error('Failed to fetch contract expiry');
  return res.json();
}