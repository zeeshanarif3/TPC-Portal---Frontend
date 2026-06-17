const BASE_URL = 'http://localhost:5000/api';

function getHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function fetchDashboardStats(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/dashboard/stats?college=${collegeId}`,
    { headers: getHeaders(token) }
  );
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchColleges(token) {
  const res = await fetch(`${BASE_URL}/colleges`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch colleges');
  return res.json();
}

export async function fetchTrainers(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/trainers?college=${collegeId}`,
    { headers: getHeaders(token) }
  );
  if (!res.ok) throw new Error('Failed to fetch trainers');
  return res.json();
}

export async function fetchUpcomingSchedule(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/schedules/upcoming?college=${collegeId}`,
    { headers: getHeaders(token) }
  );
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}

export async function fetchAttendanceChart(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/attendance/chart?college=${collegeId}`,
    { headers: getHeaders(token) }
  );
  if (!res.ok) throw new Error('Failed to fetch attendance');
  return res.json();
}

export async function fetchCourseDistribution(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/attendance/distribution?college=${collegeId}`,  // moved to attendance route
    { headers: getHeaders(token) }
  );
  if (!res.ok) throw new Error('Failed to fetch course distribution');
  return res.json();
}

export async function fetchContractExpiry(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/contracts/expiry?college=${collegeId}`,
    { headers: getHeaders(token) }
  );
  if (!res.ok) throw new Error('Failed to fetch contract expiry');
  return res.json();
}






// // dashboardApi.js

// const BASE_URL = 'http://localhost:5000/api';

// function getHeaders(token) {

//   return {
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${token}`,
//   };
// }

// export async function fetchDashboardStats(collegeId , token) {
//   const res = await fetch(
//     `${BASE_URL}/dashboard/stats?college=${collegeId}`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error('Failed to fetch stats');
//   return res.json();
// }

// export async function fetchColleges() {
//   const res = await fetch(`${BASE_URL}/colleges`, {
//     headers: getHeaders(),
//   });

//   if (!res.ok) throw new Error('Failed to fetch colleges');
//   return res.json();
// }

// export async function fetchTrainers(collegeId) {
//   const res = await fetch(
//     `${BASE_URL}/trainers?college=${collegeId}`,
//     {
//       headers: getHeaders(),
//     }
//   );

//   if (!res.ok) throw new Error('Failed to fetch trainers');
//   return res.json();
// }

// export async function fetchUpcomingSchedule(collegeId) {
//   const res = await fetch(
//     `${BASE_URL}/schedules/upcoming?college=${collegeId}`,
//     {
//       headers: getHeaders(),
//     }
//   );

//   if (!res.ok) throw new Error('Failed to fetch schedule');
//   return res.json();
// }

// export async function fetchAttendanceChart(collegeId) {
//   const res = await fetch(
//     `${BASE_URL}/attendance/chart?college=${collegeId}`,
//     {
//       headers: getHeaders(),
//     }
//   );

//   if (!res.ok) throw new Error('Failed to fetch attendance');
//   return res.json();
// }

// export async function fetchSubjectDistribution(collegeId) {
//   const res = await fetch(
//     `${BASE_URL}/subjects/distribution?college=${collegeId}`,
//     {
//       headers: getHeaders(),
//     }
//   );

//   if (!res.ok) throw new Error('Failed to fetch subject distribution');
//   return res.json();
// }

// export async function fetchContractExpiry(collegeId) {
//   const res = await fetch(
//     `${BASE_URL}/contracts/expiry?college=${collegeId}`,
//     {
//       headers: getHeaders(),
//     }
//   );

//   if (!res.ok) throw new Error('Failed to fetch contract expiry');
//   return res.json();
// }

// // // dashboardApi.js
// // // Mock API layer — replace base URL and endpoints with your actual backend

// // // const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
// // const BASE_URL = 'http://localhost:5000/api';

// // export async function fetchDashboardStats(collegeId) {
// //   const res = await fetch(`${BASE_URL}/dashboard/stats?college=${collegeId}`);
// //   if (!res.ok) throw new Error('Failed to fetch stats');
// //   return res.json();
// // }

// // export async function fetchColleges() {
// //   const res = await fetch(`${BASE_URL}/colleges`);
// //   if (!res.ok) throw new Error('Failed to fetch colleges');``
// //   return res.json();
// // }

// // export async function fetchTrainers(collegeId) {
// //   const res = await fetch(`${BASE_URL}/trainers?college=${collegeId}`);
// //   if (!res.ok) throw new Error('Failed to fetch trainers');
// //   return res.json();
// // }

// // export async function fetchUpcomingSchedule(collegeId) {
// //   const res = await fetch(`${BASE_URL}/schedule/upcoming?college=${collegeId}`);
// //   if (!res.ok) throw new Error('Failed to fetch schedule');
// //   return res.json();
// // }

// // export async function fetchAttendanceChart(collegeId) {
// //   const res = await fetch(`${BASE_URL}/attendance/chart?college=${collegeId}`);
// //   if (!res.ok) throw new Error('Failed to fetch attendance');
// //   return res.json();
// // }

// // export async function fetchSubjectDistribution(collegeId) {
// //   const res = await fetch(`${BASE_URL}/subjects/distribution?college=${collegeId}`);
// //   if (!res.ok) throw new Error('Failed to fetch subject distribution');
// //   return res.json();
// // }

// // export async function fetchContractExpiry(collegeId) {
// //   const res = await fetch(`${BASE_URL}/contracts/expiry?college=${collegeId}`);
// //   if (!res.ok) throw new Error('Failed to fetch contract expiry');
// //   return res.json();
// // }