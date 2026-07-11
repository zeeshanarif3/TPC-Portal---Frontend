const BASE_URL = 'http://localhost:5000/api';

function getHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
function getqueryHeader(token) {
  const query = { 'Content-Type': 'application/json' };
  if (token) query.collegeId = `Bearer ${token}`;
  return query;
}



export async function fetchDashboardStats(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/dashboard/stats?college=${collegeId}`,
    { headers: getHeaders(token) }
  );
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

// export async function fetchColleges(token) {
//   const res = await fetch(`${BASE_URL}/colleges`, {
//     headers: getHeaders(token),
//   });
//   if (!res.ok) throw new Error('Failed to fetch colleges');
//   return res.json();
// }



//colleges


// Create college
export async function createCollege(data, token) {
  const res = await fetch(
    `${BASE_URL}/colleges`,
    {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to create college");
  return res.json();
}

// Get all colleges
export async function fetchColleges(token) {
  const res = await fetch(
    `${BASE_URL}/colleges`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch colleges");
  return res.json();
}

// Get college by ID
export async function fetchCollegeById(id, token) {
  const res = await fetch(
    `${BASE_URL}/colleges/${id}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch college");
  return res.json();
}

// Update college
export async function updateCollege(id, data, token) {
  const res = await fetch(
    `${BASE_URL}/colleges/${id}`,
    {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to update college");
  return res.json();
}

// Delete college
export async function deleteCollege(id, token) {
  const res = await fetch(
    `${BASE_URL}/colleges/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to delete college");
  return res.json();
}














// attendance







// Get trainer's upcoming classes
// export async function fetchUpcomingClasses(token) {
//   const res = await fetch(
//     `${BASE_URL}/attendance/upcoming-classes`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch upcoming classes");
//   return res.json();
// }


// router.get('/college/:collegeId/session/:sessionId', verifyToken, adminModeratorMiddleware, getAttendanceByCollegeAndSession);

export async function fetchAttendanceByCollegeAndSession(collegeId, sessionId, token) {
  const res = await fetch(
    `${BASE_URL}/attendance/college/${collegeId}/session/${sessionId}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch attendance");
  return res.json();
}




export async function fetchUpcomingClasses(token) {
  const res = await fetch(
    `${BASE_URL}/attendance/upcoming-classes`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch upcoming classes");

  const data = await res.json();
  console.log(data);
  return data;
}

// Create attendance
export async function createAttendance(data, token) {
  const res = await fetch(
    `${BASE_URL}/attendance`,
    {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to create attendance");
  return res.json();
}

// Update attendance
export async function updateAttendance(data, token) {
  const res = await fetch(
    `${BASE_URL}/attendance`,
    {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to update attendance");
  return res.json();
}

// Get attendance by ID
export async function fetchAttendanceById(id, token) {
  const res = await fetch(
    `${BASE_URL}/attendance/${id}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch attendance");
  return res.json();
}

// Get attendance by session and date
export async function fetchAttendanceBySessionAndDate(sessionId, date, token) {
  const res = await fetch(
    `${BASE_URL}/attendance/session?sessionId=${sessionId}&date=${date}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch attendance");
  return res.json();
}

// Get moderator analytics
export async function fetchAnalytics(token) {
  const res = await fetch(
    `${BASE_URL}/attendance/analytics`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

// Get attendance chart
export async function fetchAttendanceChart(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/attendance/chart?collegeId=${collegeId}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch attendance chart");

  // return res.json();
  const data = await res.json();
  // console.log(data);
  return data;
}

// Get subject distribution
export async function fetchSubjectDistribution(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/attendance/distribution?collegeId=${collegeId}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch subject distribution");
  return res.json();
}














// for schedules 






// // Create schedule
// export async function createSchedule(data, token) {
//   const res = await fetch(
//     `${BASE_URL}/schedules`,
//     {
//       method: "POST",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to create schedule");
//   return res.json();
// }

// // Get all schedules
// export async function fetchSchedules(token) {
//   const res = await fetch(
//     `${BASE_URL}/schedules`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch schedules");
//   return res.json();
// }

// // Get schedule by ID
// export async function fetchScheduleById(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/schedules/${id}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch schedule");
//   return res.json();
// }

// // Update schedule
// export async function updateSchedule(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/schedules/${id}`,
//     {
//       method: "PUT",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update schedule");
//   return res.json();
// }

// // Delete schedule
// export async function deleteSchedule(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/schedules/${id}`,
//     {
//       method: "DELETE",
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to delete schedule");
//   return res.json();
// }

// // Get upcoming schedule for a college
// export async function fetchUpcomingSchedule(collegeId, token) {
//   const res = await fetch(
//     `${BASE_URL}/schedules/upcoming?collegeId=${collegeId}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch upcoming schedule");
//   const data = await res.json();
//   console.log(data);
//   return data;
// }



// schedules

// Create schedule
export async function createSchedule(data, token) {
  const res = await fetch(
    `${BASE_URL}/schedules`,
    {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to create schedule");
  return res.json();
}


// Get all schedules
export async function fetchSchedules(token, date = null) {
  const url = date
    ? `${BASE_URL}/schedules?date=${date}`
    : `${BASE_URL}/schedules`;

  const res = await fetch(
    url,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch schedules");
  return res.json();
}


// Get schedule by ID
export async function fetchScheduleById(id, token) {
  const res = await fetch(
    `${BASE_URL}/schedules/${id}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch schedule");
  return res.json();
}


// Update schedule
export async function updateSchedule(id, data, token) {
  const res = await fetch(
    `${BASE_URL}/schedules/${id}`,
    {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to update schedule");
  return res.json();
}


// Delete schedule
export async function deleteSchedule(id, token) {
  const res = await fetch(
    `${BASE_URL}/schedules/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to delete schedule");
  return res.json();
}


// Get upcoming schedules by college
export async function fetchUpcomingScheduleByCollege(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/schedules/upcoming?collegeId=${collegeId}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch upcoming schedules");
  return res.json();
}


// Append slots through CSV
export async function appendSlotsViaCSV(rows, token) {
  const res = await fetch(
    `${BASE_URL}/schedules/append-slots-csv`,
    {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(rows)
    }
  );

  if (!res.ok) throw new Error("Failed to append CSV slots");
  return res.json();
}








// contracts






// Create contract
export async function createContract(data, token) {
  const res = await fetch(
    `${BASE_URL}/contracts`,
    {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to create contract");
  return res.json();
}

// Get all contracts
export async function fetchContracts(token) {
  const res = await fetch(
    `${BASE_URL}/contracts`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch contracts");
  return res.json();
}

// Get contract by ID
export async function fetchContractById(id, token) {
  const res = await fetch(
    `${BASE_URL}/contracts/${id}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch contract");
  return res.json();
}

// Update contract
export async function updateContract(id, data, token) {
  const res = await fetch(
    `${BASE_URL}/contracts/${id}`,
    {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to update contract");
  return res.json();
}

// Delete contract
export async function deleteContract(id, token) {
  const res = await fetch(
    `${BASE_URL}/contracts/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to delete contract");
  return res.json();
}

// Get contract expiry for a college
export async function fetchContractExpiry(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/contracts/expiry?collegeId=${collegeId}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch contract expiry");
  return res.json();
}


















// sessions







// Create session
export async function createSession(data, token) {
  const res = await fetch(
    `${BASE_URL}/sessions`,
    {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

// Get all sessions
export async function fetchSessions(token) {
  const res = await fetch(
    `${BASE_URL}/sessions`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

// Get session by ID
export async function fetchSessionById(id, token) {
  const res = await fetch(
    `${BASE_URL}/sessions/${id}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch session");
  return res.json();
}

// Update session
export async function updateSession(id, data, token) {
  const res = await fetch(
    `${BASE_URL}/sessions/${id}`,
    {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to update session");
  return res.json();
}

// Delete session
export async function deleteSession(id, token) {
  const res = await fetch(
    `${BASE_URL}/sessions/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to delete session");
  return res.json();
}











// students








// Create student
export async function createStudent(data, token) {
  const res = await fetch(
    `${BASE_URL}/students`,
    {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to create student");
  return res.json();
}

// Get all students
export async function fetchStudents(token) {
  const res = await fetch(
    `${BASE_URL}/students`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

// Get student by ID
export async function fetchStudentById(id, token) {
  const res = await fetch(
    `${BASE_URL}/students/${id}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch student");
  return res.json();
}

// Update student
export async function updateStudent(id, data, token) {
  const res = await fetch(
    `${BASE_URL}/students/${id}`,
    {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to update student");
  return res.json();
}

// Delete student
export async function deleteStudent(id, token) {
  const res = await fetch(
    `${BASE_URL}/students/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to delete student");
  return res.json();
}






// cources

// Create course
export async function createCourse(data, token) {
  const res = await fetch(
    `${BASE_URL}/courses`,
    {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to create course");
  return res.json();
}

// Get all courses
export async function fetchCourses(token) {
  const res = await fetch(
    `${BASE_URL}/courses`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
}

// Get course by ID
export async function fetchCourseById(id, token) {
  const res = await fetch(
    `${BASE_URL}/courses/${id}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch course");
  return res.json();
}

// Update course
export async function updateCourse(id, data, token) {
  const res = await fetch(
    `${BASE_URL}/courses/${id}`,
    {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to update course");
  return res.json();
}

// Delete course
export async function deleteCourse(id, token) {
  const res = await fetch(
    `${BASE_URL}/courses/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to delete course");
  return res.json();
}





//trainers




// Create trainer
export async function createTrainer(data, token) {
  const res = await fetch(
    `${BASE_URL}/trainers`,
    {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to create trainer");
  return res.json();
}

// Get all trainers
export async function fetchTrainers(token) {
  const res = await fetch(
    `${BASE_URL}/trainers`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch trainers");
  return res.json();
}

// Get trainer by ID
export async function fetchTrainerById(id, token) {
  const res = await fetch(
    `${BASE_URL}/trainers/${id}`,
    {
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to fetch trainer");
  return res.json();
}

// Update trainer
export async function updateTrainer(id, data, token) {
  const res = await fetch(
    `${BASE_URL}/trainers/${id}`,
    {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data)
    }
  );

  if (!res.ok) throw new Error("Failed to update trainer");
  return res.json();
}

// Delete trainer
export async function deleteTrainer(id, token) {
  const res = await fetch(
    `${BASE_URL}/trainers/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(token)
    }
  );

  if (!res.ok) throw new Error("Failed to delete trainer");
  return res.json();
}

// Get trainers by college

export async function fetchTrainersByCollege(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/trainers?collegeId=${encodeURIComponent(collegeId)}`,
    {
      headers: getHeaders(token),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch trainers");
  }

  return res.json();
}




// Moderators


// Get all moderators
export async function getAllModerators(token) {
  try {
    const response = await fetch(`${BASE_URL}/moderators`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("Fetched moderators:", data);
    if (!response.ok) {
      throw new Error("Failed to fetch moderators");
    }
    return data;

  } catch (error) {
    console.error("Error fetching moderators:", error);
    throw error;
  }
};

// Get moderator by ID
export async function getModeratorById(id, token) {
  try {
    const response = await fetch(`${BASE_URL}/moderators/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch moderator");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching moderator:", error);
    throw error;
  }
};

// Create moderator
export async function createModerator(moderatorData, token) {
  try {
    const response = await fetch(`${BASE_URL}/moderators`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(moderatorData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create moderator");
    }

    return data;
  } catch (error) {
    console.error("Error creating moderator:", error);
    throw error;
  }
};

// Update moderator
export async function updateModerator(id, moderatorData, token) {
  try {
    const response = await fetch(`${BASE_URL}/moderators/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(moderatorData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update moderator");
    }

    return data;
  } catch (error) {
    console.error("Error updating moderator:", error);
    throw error;
  }
};

// Delete moderator
export async function deleteModerator(id, token) {
  try {
    const response = await fetch(`${BASE_URL}/moderators/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete moderator");
    }

    return data;
  } catch (error) {
    console.error("Error deleting moderator:", error);
    throw error;
  }
};









































// export async function fetchTrainers(collegeId, token) {
//   const res = await fetch(
//     `${BASE_URL}/trainers?college=${collegeId}`,
//     { headers: getHeaders(token) }
//   );
//   if (!res.ok) throw new Error('Failed to fetch trainers');
//   return res.json();
// }

// export async function fetchUpcomingSchedule(collegeId, token) {
//   const res = await fetch(
//     `${BASE_URL}/schedules/upcoming?college=${collegeId}`,
//     { headers: getHeaders(token) }
//   );
//   if (!res.ok) throw new Error('Failed to fetch schedule');
//   return res.json();
// }

// export async function fetchAttendanceChart(collegeId, token) {
//   const res = await fetch(
//     `${BASE_URL}/attendance/chart?college=${collegeId}`,
//     { headers: getHeaders(token) }
//   );
//   if (!res.ok) throw new Error('Failed to fetch attendance');
//   return res.json();
// }

// export async function fetchCourseDistribution(collegeId, token) {
//   const res = await fetch(
//     `${BASE_URL}/attendance/distribution?college=${collegeId}`,  // moved to attendance route
//     { headers: getHeaders(token) }
//   );
//   if (!res.ok) throw new Error('Failed to fetch course distribution');
//   return res.json();
// }

// export async function fetchContractExpiry(collegeId, token) {
//   const res = await fetch(
//     `${BASE_URL}/contracts/expiry?college=${collegeId}`,
//     { headers: getHeaders(token) }
//   );
//   if (!res.ok) throw new Error('Failed to fetch contract expiry');
//   return res.json();
// }






// // // dashboardApi.js

// // const BASE_URL = 'http://localhost:5000/api';

// // function getHeaders(token) {

// //   return {
// //     'Content-Type': 'application/json',
// //     Authorization: `Bearer ${token}`,
// //   };
// // }

// // export async function fetchDashboardStats(collegeId , token) {
// //   const res = await fetch(
// //     `${BASE_URL}/dashboard/stats?college=${collegeId}`,
// //     {
// //       headers: getHeaders(token),
// //     }
// //   );

// //   if (!res.ok) throw new Error('Failed to fetch stats');
// //   return res.json();
// // }

// // export async function fetchColleges() {
// //   const res = await fetch(`${BASE_URL}/colleges`, {
// //     headers: getHeaders(),
// //   });

// //   if (!res.ok) throw new Error('Failed to fetch colleges');
// //   return res.json();
// // }

// // export async function fetchTrainers(collegeId) {
// //   const res = await fetch(
// //     `${BASE_URL}/trainers?college=${collegeId}`,
// //     {
// //       headers: getHeaders(),
// //     }
// //   );

// //   if (!res.ok) throw new Error('Failed to fetch trainers');
// //   return res.json();
// // }

// // export async function fetchUpcomingSchedule(collegeId) {
// //   const res = await fetch(
// //     `${BASE_URL}/schedules/upcoming?college=${collegeId}`,
// //     {
// //       headers: getHeaders(),
// //     }
// //   );

// //   if (!res.ok) throw new Error('Failed to fetch schedule');
// //   return res.json();
// // }

// // export async function fetchAttendanceChart(collegeId) {
// //   const res = await fetch(
// //     `${BASE_URL}/attendance/chart?college=${collegeId}`,
// //     {
// //       headers: getHeaders(),
// //     }
// //   );

// //   if (!res.ok) throw new Error('Failed to fetch attendance');
// //   return res.json();
// // }

// // export async function fetchSubjectDistribution(collegeId) {
// //   const res = await fetch(
// //     `${BASE_URL}/subjects/distribution?college=${collegeId}`,
// //     {
// //       headers: getHeaders(),
// //     }
// //   );

// //   if (!res.ok) throw new Error('Failed to fetch subject distribution');
// //   return res.json();
// // }

// // export async function fetchContractExpiry(collegeId) {
// //   const res = await fetch(
// //     `${BASE_URL}/contracts/expiry?college=${collegeId}`,
// //     {
// //       headers: getHeaders(),
// //     }
// //   );

// //   if (!res.ok) throw new Error('Failed to fetch contract expiry');
// //   return res.json();
// // }

// // // // dashboardApi.js
// // // // Mock API layer — replace base URL and endpoints with your actual backend

// // // // const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
// // // const BASE_URL = 'http://localhost:5000/api';

// // // export async function fetchDashboardStats(collegeId) {
// // //   const res = await fetch(`${BASE_URL}/dashboard/stats?college=${collegeId}`);
// // //   if (!res.ok) throw new Error('Failed to fetch stats');
// // //   return res.json();
// // // }

// // // export async function fetchColleges() {
// // //   const res = await fetch(`${BASE_URL}/colleges`);
// // //   if (!res.ok) throw new Error('Failed to fetch colleges');``
// // //   return res.json();
// // // }

// // // export async function fetchTrainers(collegeId) {
// // //   const res = await fetch(`${BASE_URL}/trainers?college=${collegeId}`);
// // //   if (!res.ok) throw new Error('Failed to fetch trainers');
// // //   return res.json();
// // // }

// // // export async function fetchUpcomingSchedule(collegeId) {
// // //   const res = await fetch(`${BASE_URL}/schedule/upcoming?college=${collegeId}`);
// // //   if (!res.ok) throw new Error('Failed to fetch schedule');
// // //   return res.json();
// // // }

// // // export async function fetchAttendanceChart(collegeId) {
// // //   const res = await fetch(`${BASE_URL}/attendance/chart?college=${collegeId}`);
// // //   if (!res.ok) throw new Error('Failed to fetch attendance');
// // //   return res.json();
// // // }

// // // export async function fetchSubjectDistribution(collegeId) {
// // //   const res = await fetch(`${BASE_URL}/subjects/distribution?college=${collegeId}`);
// // //   if (!res.ok) throw new Error('Failed to fetch subject distribution');
// // //   return res.json();
// // // }

// // // export async function fetchContractExpiry(collegeId) {
// // //   const res = await fetch(`${BASE_URL}/contracts/expiry?college=${collegeId}`);
// // //   if (!res.ok) throw new Error('Failed to fetch contract expiry');
// // //   return res.json();
// // // }