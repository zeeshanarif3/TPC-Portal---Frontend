// const BASE_URL = "http://localhost:5000/api";
// temporary const
// const BASE_URL = "https://spiritual-methodology-foster-unknown.trycloudflare.com/api";
export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getHeaders(token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function getqueryHeader(token) {
  const query = { "Content-Type": "application/json" };
  if (token) query.collegeId = `Bearer ${token}`;
  return query;
}

async function handleResponse(res, defaultMessage) {
  let json = {};

  try {
    json = await res.json();
  } catch {
    // Some endpoints may not return JSON on error/success.
  }

  if (!res.ok) {
    throw new Error(json.message || defaultMessage);
  }

  return json;
}

async function handleBlobResponse(res, defaultMessage) {
  if (!res.ok) {
    let json = {};
    try {
      json = await res.json();
    } catch {
      // Ignore non-JSON errors.
    }
    throw new Error(json.message || defaultMessage);
  }

  return res.blob();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// dashboard
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function fetchDashboardStats(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/dashboard/stats?college=${collegeId}`,
    { headers: getHeaders(token) }
  );

  return handleResponse(res, "Failed to fetch stats");
}

export async function updateUserActiveStatus(id, active, token) {
  const res = await fetch(`${BASE_URL}/admin/users/${id}/active`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({ active }),
  });

  return handleResponse(res, "Failed to update user active status");
}

export async function fetchUsersForAdmin(token) {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch users");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// colleges
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function createCollege(data, token) {
  const res = await fetch(`${BASE_URL}/colleges`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to create college");
}

export async function fetchColleges(token) {
  const res = await fetch(`${BASE_URL}/colleges`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch colleges");
}

export async function fetchCollegeById(id, token) {
  const res = await fetch(`${BASE_URL}/colleges/${id}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch college");
}

export async function updateCollege(id, data, token) {
  const res = await fetch(`${BASE_URL}/colleges/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to update college");
}

export async function deleteCollege(id, token) {
  const res = await fetch(`${BASE_URL}/colleges/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to delete college");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// contracts
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function createContract(data, token) {
  const res = await fetch(`${BASE_URL}/contracts`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to create contract");
}

export async function fetchContracts(token) {
  const res = await fetch(`${BASE_URL}/contracts`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch contracts");
}

export async function fetchContractById(id, token) {
  const res = await fetch(`${BASE_URL}/contracts/${id}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch contract");
}

export async function updateContract(id, data, token) {
  const res = await fetch(`${BASE_URL}/contracts/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to update contract");
}

export async function deleteContract(id, token) {
  const res = await fetch(`${BASE_URL}/contracts/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to delete contract");
}

export async function fetchContractExpiry(collegeId, token) {
  const res = await fetch(`${BASE_URL}/contracts/expiry?collegeId=${collegeId}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch contract expiry");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// sessions
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function createSession(data, token) {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to create session");
}

export async function fetchSessions(token) {
  const res = await fetch(`${BASE_URL}/sessions`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch sessions");
}

export async function fetchSessionById(id, token) {
  const res = await fetch(`${BASE_URL}/sessions/${id}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch session");
}

export async function updateSession(id, data, token) {
  const res = await fetch(`${BASE_URL}/sessions/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to update session");
}

export async function deleteSession(id, token) {
  const res = await fetch(`${BASE_URL}/sessions/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to delete session");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// students
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function createStudent(data, token) {
  const res = await fetch(`${BASE_URL}/students`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to create student");
}

export async function fetchStudents(token) {
  const res = await fetch(`${BASE_URL}/students`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch students");
}

export async function fetchStudentById(id, token) {
  const res = await fetch(`${BASE_URL}/students/${id}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch student");
}

export async function updateStudent(id, data, token) {
  const res = await fetch(`${BASE_URL}/students/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to update student");
}

export async function deleteStudent(id, token) {
  const res = await fetch(`${BASE_URL}/students/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to delete student");
}

export async function fetchStudentsByCourse(courseId, token) {
  const res = await fetch(`${BASE_URL}/students/course/${courseId}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch students by course");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// courses
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function createCourse(data, token) {
  const res = await fetch(`${BASE_URL}/courses`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to create course");
}

export async function fetchCourses(token) {
  const res = await fetch(`${BASE_URL}/courses`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch courses");
}

export async function fetchCourseById(id, token) {
  const res = await fetch(`${BASE_URL}/courses/${id}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch course");
}

export async function updateCourse(id, data, token) {
  const res = await fetch(`${BASE_URL}/courses/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to update course");
}

export async function deleteCourse(id, token) {
  const res = await fetch(`${BASE_URL}/courses/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to delete course");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// trainers
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function createTrainer(data, token) {
  const res = await fetch(`${BASE_URL}/trainers`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to create trainer");
}

export async function fetchTrainers(token) {
  const res = await fetch(`${BASE_URL}/trainers`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch trainers");
}

export async function fetchTrainerById(id, token) {
  const res = await fetch(`${BASE_URL}/trainers/${id}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch trainer");
}

export async function updateTrainer(id, data, token) {
  const res = await fetch(`${BASE_URL}/trainers/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to update trainer");
}

export async function deleteTrainer(id, token) {
  const res = await fetch(`${BASE_URL}/trainers/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to delete trainer");
}

export async function fetchTrainersByCollege(collegeId, token) {
  const res = await fetch(
    `${BASE_URL}/trainers?collegeId=${encodeURIComponent(collegeId)}`,
    { headers: getHeaders(token) }
  );

  return handleResponse(res, "Failed to fetch trainers");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// moderators
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function getAllModerators(token) {
  const response = await fetch(`${BASE_URL}/moderators`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response, "Failed to fetch moderators");
}

export async function getModeratorById(id, token) {
  const response = await fetch(`${BASE_URL}/moderators/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response, "Failed to fetch moderator");
}

export async function createModerator(moderatorData, token) {
  const response = await fetch(`${BASE_URL}/moderators`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(moderatorData),
  });

  return handleResponse(response, "Failed to create moderator");
}

export async function updateModerator(id, moderatorData, token) {
  const response = await fetch(`${BASE_URL}/moderators/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(moderatorData),
  });

  return handleResponse(response, "Failed to update moderator");
}

export async function deleteModerator(id, token) {
  const response = await fetch(`${BASE_URL}/moderators/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response, "Failed to delete moderator");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// slots
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function createSlot(data, token) {
  const res = await fetch(`${BASE_URL}/slots`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to create slot");
}

export async function fetchSlots(params = {}, token) {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/slots${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch slots");
}

export async function fetchSlotById(id, token) {
  const res = await fetch(`${BASE_URL}/slots/${id}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch slot");
}

export async function updateSlot(id, data, token) {
  const res = await fetch(`${BASE_URL}/slots/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to update slot");
}

export async function deleteSlot(id, token) {
  const res = await fetch(`${BASE_URL}/slots/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to delete slot");
}

export async function fetchUpcomingSlots(collegeId, token) {
  const res = await fetch(`${BASE_URL}/slots/upcoming?collegeId=${collegeId}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch upcoming slots");
}

export async function appendSlotsViaCSV(data, token) {
  const res = await fetch(`${BASE_URL}/slots/append-slots-csv`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to append slots");
}

export async function updateTopicAndFeedback(id, data, token) {
  const res = await fetch(`${BASE_URL}/slots/${id}/topic-feedback`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to update topic and feedback");
}

export async function fetchUpcomingClasses(token) {
  const res = await fetch(`${BASE_URL}/slots/upcoming-classes`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch upcoming classes");
}

export async function submitAttendance(id, data, token) {
  const res = await fetch(`${BASE_URL}/slots/${id}/attendance`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to submit attendance");
}

export async function fetchAttendanceById(id, token) {
  const res = await fetch(`${BASE_URL}/slots/${id}/attendance`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch attendance");
}

export async function fetchSlotAnalytics(token) {
  const res = await fetch(`${BASE_URL}/slots/analytics`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch analytics");
}

export async function fetchAttendanceChart(collegeId, token) {
  const res = await fetch(`${BASE_URL}/slots/chart?collegeId=${collegeId}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch attendance chart");
}

export async function fetchSubjectDistribution(collegeId, token) {
  const res = await fetch(`${BASE_URL}/slots/distribution?collegeId=${collegeId}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch subject distribution");
}

export async function fetchAttendanceByCollegeAndSession(
  collegeId,
  sessionId,
  token
) {
  const res = await fetch(
    `${BASE_URL}/slots/college/${collegeId}/session/${sessionId}`,
    { headers: getHeaders(token) }
  );

  return handleResponse(res, "Failed to fetch attendance records");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// content
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function createContentSkeleton(data, token) {
  const res = await fetch(`${BASE_URL}/content/skeleton`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to create content skeleton");
}

export async function fetchContentSkeletons(token, query = {}) {
  const params = new URLSearchParams(query).toString();

  const res = await fetch(
    `${BASE_URL}/content/skeleton${params ? `?${params}` : ""}`,
    { headers: getHeaders(token) }
  );

  return handleResponse(res, "Failed to fetch content skeletons");
}

export async function fetchContentSkeletonById(id, token) {
  const res = await fetch(`${BASE_URL}/content/skeleton/${id}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch content skeleton");
}

export async function updateContentSkeleton(id, data, token) {
  const res = await fetch(`${BASE_URL}/content/skeleton/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to update content skeleton");
}

export async function deleteContentSkeleton(id, token) {
  const res = await fetch(`${BASE_URL}/content/skeleton/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to delete content skeleton");
}

export async function createContent(data, token) {
  const res = await fetch(`${BASE_URL}/content`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  return handleResponse(res, "Failed to create content");
}

export async function fetchContents(token, query = {}) {
  const params = new URLSearchParams(query).toString();

  const res = await fetch(
    `${BASE_URL}/content${params ? `?${params}` : ""}`,
    { headers: getHeaders(token) }
  );

  return handleResponse(res, "Failed to fetch content");
}

export async function fetchContentById(id, token) {
  const res = await fetch(`${BASE_URL}/content/${id}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch content");
}

export async function updateContent(id, data, token) {
  const res = await fetch(`${BASE_URL}/content/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  return handleResponse(res, "Failed to update content");
}

export async function downloadContent(id, token) {
  const res = await fetch(`${BASE_URL}/content/${id}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleBlobResponse(res, "Failed to download content");
}

export async function deleteContent(id, token) {
  const res = await fetch(`${BASE_URL}/content/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to delete content");
}

export async function handlePreviewFile(id, token) {
  const res = await fetch(`${BASE_URL}/content/${id}/preview`, {
    method: "GET",
    headers: getHeaders(token),
  });

  return handleBlobResponse(res, "Failed to preview content");
}

export async function handleDownloadFile(id, token) {
  const res = await fetch(`${BASE_URL}/content/${id}/download`, {
    method: "GET",
    headers: getHeaders(token),
  });

  return handleBlobResponse(res, "Failed to download content");
}

export async function fetchProgramStructure(token) {
  const res = await fetch(`${BASE_URL}/content/program-structure`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch program structure");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// assessments
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function createAssessment(data, token) {
  const res = await fetch(`${BASE_URL}/assessments`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to create assessment");
}

export async function fetchAssessments(token) {
  const res = await fetch(`${BASE_URL}/assessments`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch assessments");
}

export async function fetchAssessmentById(id, token) {
  const res = await fetch(`${BASE_URL}/assessments/${id}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch assessment");
}

export async function updateAssessment(id, data, token) {
  const res = await fetch(`${BASE_URL}/assessments/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to update assessment");
}

export async function deleteAssessment(id, token) {
  const res = await fetch(`${BASE_URL}/assessments/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to delete assessment");
}

export async function submitAssessment(id, answers, token) {
  const res = await fetch(`${BASE_URL}/assessments/${id}/submit`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ answers }),
  });

  return handleResponse(res, "Failed to submit assessment");
}

export async function fetchMyAssessmentSubmission(id, token) {
  const res = await fetch(`${BASE_URL}/assessments/${id}/submissions/me`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch submission");
}

export async function fetchAssessmentSubmissions(id, token) {
  const res = await fetch(`${BASE_URL}/assessments/${id}/submissions`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch assessment submissions");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// feedback
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function createFeedback(data, token) {
  const res = await fetch(`${BASE_URL}/feedback`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to create feedback");
}

export async function fetchFeedback(token, query = {}) {
  const params = new URLSearchParams(query).toString();

  const res = await fetch(`${BASE_URL}/feedback${params ? `?${params}` : ""}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch feedback");
}

export async function fetchMyFeedback(token) {
  const res = await fetch(`${BASE_URL}/feedback/me`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch my feedback");
}

export async function updateFeedback(id, data, token) {
  const res = await fetch(`${BASE_URL}/feedback/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Failed to update feedback");
}

export async function deleteFeedback(id, token) {
  const res = await fetch(`${BASE_URL}/feedback/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to delete feedback");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// performance
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function fetchMyPerformance(token) {
  const res = await fetch(`${BASE_URL}/performance/me`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch my performance");
}

export async function fetchStudentPerformance(studentId, token) {
  const res = await fetch(`${BASE_URL}/performance/${studentId}`, {
    headers: getHeaders(token),
  });

  return handleResponse(res, "Failed to fetch student performance");
}


















// // const BASE_URL = "http://localhost:5000/api";
// //temporaryconst 
// // const BASE_URL = "https://spiritual-methodology-foster-unknown.trycloudflare.com/api";
// export const BASE_URL =
//   import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// function getHeaders(token) {
//   const headers = { "Content-Type": "application/json" };
//   if (token) headers.Authorization = `Bearer ${token}`;
//   return headers;
// }
// function getqueryHeader(token) {
//   const query = { "Content-Type": "application/json" };
//   if (token) query.collegeId = `Bearer ${token}`;
//   return query;
// }



// export async function fetchDashboardStats(collegeId, token) {
//   const res = await fetch(
//     `${BASE_URL}/dashboard/stats?college=${collegeId}`,
//     { headers: getHeaders(token) }
//   );
//   // if (!res.ok) throw new Error("Failed to fetch stats");
//     if (!res.ok) {
//     throw new Error(json.message || "Failed to create student");
//   }

//   return res.json();
// }

// // export async function fetchColleges(token) {
// //   const res = await fetch(`${BASE_URL}/colleges`, {
// //     headers: getHeaders(token),
// //   });
// //   if (!res.ok) throw new Error("Failed to fetch colleges");
// //   return res.json();
// // }

// // Update user active status
// export async function updateUserActiveStatus(id, active, token) {
//   const res = await fetch(
//     `${BASE_URL}/admin/users/${id}/active`,
//     {
//       method: "PATCH",
//       headers: getHeaders(token),
//       body: JSON.stringify({ active }),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update user active status");
//   return res.json();
// }

// // Fetch all moderators and trainers (Admin)
// export async function fetchUsersForAdmin(token) {
//   const res = await fetch(
//     `${BASE_URL}/admin/users`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch users");
//   return res.json();
// }

// //colleges //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// // Create college
// export async function createCollege(data, token) {
//   const res = await fetch(
//     `${BASE_URL}/colleges`,
//     {
//       method: "POST",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to create college");
//   return res.json();
// }

// // Get all colleges
// export async function fetchColleges(token) {
//   const res = await fetch(
//     `${BASE_URL}/colleges`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch colleges");
//   return res.json();
// }

// // Get college by ID
// export async function fetchCollegeById(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/colleges/${id}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch college");
//   return res.json();
// }

// // Update college
// export async function updateCollege(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/colleges/${id}`,
//     {
//       method: "PUT",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update college");
//   return res.json();
// }

// // Delete college
// export async function deleteCollege(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/colleges/${id}`,
//     {
//       method: "DELETE",
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to delete college");
//   return res.json();
// }






// // contracts //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






// // Create contract
// export async function createContract(data, token) {
//   const res = await fetch(
//     `${BASE_URL}/contracts`,
//     {
//       method: "POST",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to create contract");
//   return res.json();
// }

// // Get all contracts
// export async function fetchContracts(token) {
//   const res = await fetch(
//     `${BASE_URL}/contracts`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch contracts");
//   return res.json();
// }

// // Get contract by ID
// export async function fetchContractById(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/contracts/${id}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch contract");
//   return res.json();
// }

// // Update contract
// export async function updateContract(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/contracts/${id}`,
//     {
//       method: "PUT",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update contract");
//   return res.json();
// }

// // Delete contract
// export async function deleteContract(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/contracts/${id}`,
//     {
//       method: "DELETE",
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to delete contract");
//   return res.json();
// }

// // Get contract expiry for a college
// export async function fetchContractExpiry(collegeId, token) {
//   const res = await fetch(
//     `${BASE_URL}/contracts/expiry?collegeId=${collegeId}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch contract expiry");
//   return res.json();
// }


















// // sessions//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







// // Create session
// export async function createSession(data, token) {
//   const res = await fetch(
//     `${BASE_URL}/sessions`,
//     {
//       method: "POST",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to create session");
//   return res.json();
// }

// // Get all sessions
// export async function fetchSessions(token) {
//   const res = await fetch(
//     `${BASE_URL}/sessions`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch sessions");
//   return res.json();
// }

// // Get session by ID
// export async function fetchSessionById(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/sessions/${id}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch session");
//   return res.json();
// }

// // Update session
// export async function updateSession(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/sessions/${id}`,
//     {
//       method: "PUT",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update session");
//   return res.json();
// }

// // Delete session
// export async function deleteSession(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/sessions/${id}`,
//     {
//       method: "DELETE",
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to delete session");
//   return res.json();
// }











// // students//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








// // Create student
// // export async function createStudent(data, token) {
// //   const res = await fetch(
// //     `${BASE_URL}/students`,
// //     {
// //       method: "POST",
// //       headers: getHeaders(token),
// //       body: JSON.stringify(data)
// //     }
// //   );

// //   if (!res.ok) throw new Error("Failed to create student");
// //   return res.json();
// // }

// export async function createStudent(data, token) {
//   const res = await fetch(`${BASE_URL}/students`, {
//     method: "POST",
//     headers: getHeaders(token),
//     body: JSON.stringify(data),
//   });

//   const json = await res.json();

//   if (!res.ok) {
//     throw new Error(json.message || "Failed to create student");
//   }

//   return json;
// }
// // Get all students
// export async function fetchStudents(token) {
//   const res = await fetch(
//     `${BASE_URL}/students`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch students");
//   return res.json();
// }

// // Get student by ID
// export async function fetchStudentById(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/students/${id}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch student");
//   return res.json();
// }

// // Update student
// export async function updateStudent(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/students/${id}`,
//     {
//       method: "PUT",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update student");
//   return res.json();
// }

// // Delete student
// export async function deleteStudent(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/students/${id}`,
//     {
//       method: "DELETE",
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to delete student");
//   return res.json();
// }


// // Get students by course
// export async function fetchStudentsByCourse(courseId, token) {
//   const res = await fetch(
//     `${BASE_URL}/students/course/${courseId}`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch students by course");
//   return res.json();
// }



// // cources//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// // Create course
// export async function createCourse(data, token) {
//   const res = await fetch(
//     `${BASE_URL}/courses`,
//     {
//       method: "POST",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to create course");
//   return res.json();
// }

// // Get all courses
// export async function fetchCourses(token) {
//   const res = await fetch(
//     `${BASE_URL}/courses`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch courses");
//   return res.json();
// }

// // Get course by ID
// export async function fetchCourseById(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/courses/${id}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch course");
//   return res.json();
// }

// // Update course
// export async function updateCourse(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/courses/${id}`,
//     {
//       method: "PUT",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update course");
//   return res.json();
// }

// // Delete course
// export async function deleteCourse(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/courses/${id}`,
//     {
//       method: "DELETE",
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to delete course");
//   return res.json();
// }





// //trainers//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




// // Create trainer
// export async function createTrainer(data, token) {
//   const res = await fetch(
//     `${BASE_URL}/trainers`,
//     {
//       method: "POST",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to create trainer");
//   return res.json();
// }

// // Get all trainers
// export async function fetchTrainers(token) {
//   const res = await fetch(
//     `${BASE_URL}/trainers`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch trainers");
//   return res.json();
// }

// // Get trainer by ID
// export async function fetchTrainerById(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/trainers/${id}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch trainer");
//   return res.json();
// }

// // Update trainer
// export async function updateTrainer(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/trainers/${id}`,
//     {
//       method: "PUT",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update trainer");
//   return res.json();
// }

// // Delete trainer
// export async function deleteTrainer(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/trainers/${id}`,
//     {
//       method: "DELETE",
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to delete trainer");
//   return res.json();
// }

// // Get trainers by college

// export async function fetchTrainersByCollege(collegeId, token) {
//   const res = await fetch(
//     `${BASE_URL}/trainers?collegeId=${encodeURIComponent(collegeId)}`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) {
//     throw new Error("Failed to fetch trainers");
//   }

//   return res.json();
// }




// // Moderators //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// // Get all moderators
// export async function getAllModerators(token) {
//   try {
//     const response = await fetch(`${BASE_URL}/moderators`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     const data = await response.json();
//     console.log("Fetched moderators:", data);
//     if (!response.ok) {
//       throw new Error("Failed to fetch moderators");
//     }
//     return data;

//   } catch (error) {
//     console.error("Error fetching moderators:", error);
//     throw error;
//   }
// };

// // Get moderator by ID
// export async function getModeratorById(id, token) {
//   try {
//     const response = await fetch(`${BASE_URL}/moderators/${id}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch moderator");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error fetching moderator:", error);
//     throw error;
//   }
// };

// // Create moderator
// export async function createModerator(moderatorData, token) {
//   try {
//     const response = await fetch(`${BASE_URL}/moderators`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(moderatorData),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Failed to create moderator");
//     }

//     return data;
//   } catch (error) {
//     console.error("Error creating moderator:", error);
//     throw error;
//   }
// };

// // Update moderator
// export async function updateModerator(id, moderatorData, token) {
//   try {
//     const response = await fetch(`${BASE_URL}/moderators/${id}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(moderatorData),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Failed to update moderator");
//     }

//     return data;
//   } catch (error) {
//     console.error("Error updating moderator:", error);
//     throw error;
//   }
// };

// // Delete moderator
// export async function deleteModerator(id, token) {
//   try {
//     const response = await fetch(`${BASE_URL}/moderators/${id}`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Failed to delete moderator");
//     }

//     return data;
//   } catch (error) {
//     console.error("Error deleting moderator:", error);
//     throw error;
//   }
// };











// // slots //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// // Create slot
// export async function createSlot(data, token) {
//   const res = await fetch(
//     `${BASE_URL}/slots`,
//     {
//       method: "POST",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to create slot");
//   return res.json();
// }

// export async function fetchSlots(params = {}, token) {
//   const query = new URLSearchParams(params).toString();

//   const url = `${BASE_URL}/slots${query ? `?${query}` : ""}`;
//   console.log("Fetching:", url);

//   const res = await fetch(url, {
//     headers: getHeaders(token)
//   });

//   const data = await res.json();

//   console.log("Status:", res.status);
//   console.log("Response:", data);

//   if (!res.ok) throw new Error("Failed to fetch slots");

//   return data;
// }

// // Get slot by ID
// export async function fetchSlotById(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/slots/${id}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch slot");
//   return res.json();
// }


// // Update slot
// export async function updateSlot(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/slots/${id}`,
//     {
//       method: "PUT",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update slot");
//   return res.json();
// }


// // Delete slot
// export async function deleteSlot(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/slots/${id}`,
//     {
//       method: "DELETE",
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to delete slot");
//   return res.json();
// }


// // Get upcoming slots by college
// export async function fetchUpcomingSlots(collegeId, token) {
//   const res = await fetch(
//     `${BASE_URL}/slots/upcoming?collegeId=${collegeId}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch upcoming slots");
//   return res.json();
// }


// // Append slots using CSV data
// export async function appendSlotsViaCSV(data, token) {
//   const res = await fetch(
//     `${BASE_URL}/slots/append-slots-csv`,
//     {
//       method: "POST",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to append slots");
//   return res.json();
// }


// // Update topic and feedback
// export async function updateTopicAndFeedback(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/slots/${id}/topic-feedback`,
//     {
//       method: "PUT",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update topic and feedback");
//   return res.json();
// }


// // Get upcoming classes for trainer
// export async function fetchUpcomingClasses(token) {
//   const res = await fetch(
//     `${BASE_URL}/slots/upcoming-classes`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch upcoming classes");
//   return res.json();
// }


// // Submit attendance
// export async function submitAttendance(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/slots/${id}/attendance`,
//     {
//       method: "PUT",
//       headers: getHeaders(token),
//       body: JSON.stringify(data)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to submit attendance");
//   return res.json();
// }


// // Get attendance by slot ID
// export async function fetchAttendanceById(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/slots/${id}/attendance`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch attendance");
//   return res.json();
// }


// // Get analytics
// export async function fetchSlotAnalytics(token) {
//   const res = await fetch(
//     `${BASE_URL}/slots/analytics`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch analytics");
//   return res.json();
// }


// // Get attendance chart
// export async function fetchAttendanceChart(collegeId, token) {
//   const res = await fetch(
//     `${BASE_URL}/slots/chart?collegeId=${collegeId}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch attendance chart");
//   return res.json();
// }


// // Get subject distribution
// export async function fetchSubjectDistribution(collegeId, token) {
//   const res = await fetch(
//     `${BASE_URL}/slots/distribution?collegeId=${collegeId}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch subject distribution");
//   return res.json();
// }


// // Get attendance by college and session
// export async function fetchAttendanceByCollegeAndSession(
//   collegeId,
//   sessionId,
//   token
// ) {
//   const res = await fetch(
//     `${BASE_URL}/slots/college/${collegeId}/session/${sessionId}`,
//     {
//       headers: getHeaders(token)
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch attendance records");
//   return res.json();
// }






// //content //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// // ================================
// // Content Skeleton API
// // ================================

// // Create skeleton
// export async function createContentSkeleton(data, token) {
//   const res = await fetch(
//     `${BASE_URL}/content/skeleton`,
//     {
//       method: "POST",
//       headers: getHeaders(token),
//       body: JSON.stringify(data),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to create content skeleton");
//   return res.json();
// }

// // Get all skeletons
// export async function fetchContentSkeletons(token, query = {}) {
//   const params = new URLSearchParams(query).toString();

//   const res = await fetch(
//     `${BASE_URL}/content/skeleton${params ? `?${params}` : ""}`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch content skeletons");
//   return res.json();
// }

// // Get skeleton by ID
// export async function fetchContentSkeletonById(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/content/skeleton/${id}`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch content skeleton");
//   return res.json();
// }

// // Update skeleton
// export async function updateContentSkeleton(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/content/skeleton/${id}`,
//     {
//       method: "PUT",
//       headers: getHeaders(token),
//       body: JSON.stringify(data),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update content skeleton");
//   return res.json();
// }

// // Delete skeleton
// export async function deleteContentSkeleton(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/content/skeleton/${id}`,
//     {
//       method: "DELETE",
//       headers: getHeaders(token),
//     }
//   );

//   const data = await res.json();

//   if (!res.ok) {
//     throw new Error(data.message || "Failed to delete content skeleton");
//   }

//   return data;
// }


// // ================================
// // Content API
// // ================================

// // Create content (file upload)
// export async function createContent(data, token) {
//   const res = await fetch(
//     `${BASE_URL}/content`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: data, // FormData
//     }
//   );

//   if (!res.ok) throw new Error("Failed to create content");
//   return res.json();
// }

// // Get all content
// export async function fetchContents(token, query = {}) {
//   const params = new URLSearchParams(query).toString();

//   const res = await fetch(
//     `${BASE_URL}/content${params ? `?${params}` : ""}`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch content");
//   return res.json();
// }

// // Get content by ID
// export async function fetchContentById(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/content/${id}`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch content");
//   return res.json();
// }

// // Update content (supports optional file)
// export async function updateContent(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/content/${id}`,
//     {
//       method: "PUT",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: data, // FormData
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update content");
//   return res.json();
// }


// // Download content
// export async function downloadContent(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/content/${id}/download`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   if (!res.ok) throw new Error("Failed to download content");

//   return res.blob();
// }

// // Delete content
// export async function deleteContent(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/content/${id}`,
//     {
//       method: "DELETE",
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to delete content");
//   return res.json();
// }

// // Preview content
// export async function handlePreviewFile(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/content/${id}/preview`,
//     {
//       method: "GET",
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) {
//     const error = await res.json().catch(() => ({}));
//     throw new Error(error.message || "Failed to preview content");
//   }

//   return res.blob();
// }

// // Download content
// export async function handleDownloadFile(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/content/${id}/download`,
//     {
//       method: "GET",
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) {
//     const error = await res.json().catch(() => ({}));
//     throw new Error(error.message || "Failed to download content");
//   }

//   return res.blob();
// }
// // Get program structure
// export async function fetchProgramStructure(token) {
//   const res = await fetch(
//     `${BASE_URL}/content/program-structure`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch program structure");
//   return res.json();
// }


// // Assesment //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// // ================================
// // Assessment API
// // ================================

// // Create assessment
// export async function createAssessment(data, token) {
//   const res = await fetch(
//     `${BASE_URL}/assessments`,
//     {
//       method: "POST",
//       headers: getHeaders(token),
//       body: JSON.stringify(data),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to create assessment");
//   return res.json();
// }

// // Get all assessments
// export async function fetchAssessments(token) {
//   const res = await fetch(
//     `${BASE_URL}/assessments`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch assessments");
//   return res.json();
// }

// // Get assessment by ID
// export async function fetchAssessmentById(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/assessments/${id}`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch assessment");
//   return res.json();
// }

// // Update assessment
// export async function updateAssessment(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/assessments/${id}`,
//     {
//       method: "PUT",
//       headers: getHeaders(token),
//       body: JSON.stringify(data),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update assessment");
//   return res.json();
// }

// // Delete assessment
// export async function deleteAssessment(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/assessments/${id}`,
//     {
//       method: "DELETE",
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to delete assessment");
//   return res.json();
// }



// // ================================
// // Assessment Submission API
// // ================================

// // Submit assessment
// export async function submitAssessment(id, answers, token) {
//   const res = await fetch(
//     `${BASE_URL}/assessments/${id}/submit`,
//     {
//       method: "POST",
//       headers: getHeaders(token),
//       body: JSON.stringify({ answers }),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to submit assessment");
//   return res.json();
// }

// // Get my submission
// export async function fetchMyAssessmentSubmission(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/assessments/${id}/submissions/me`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch submission");
//   return res.json();
// }

// // Get all submissions for an assessment (Trainer/Admin)
// export async function fetchAssessmentSubmissions(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/assessments/${id}/submissions`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch assessment submissions");
//   return res.json();
// }


// // Feedback //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// // ================================
// // Feedback API
// // ================================

// // Create feedback
// export async function createFeedback(data, token) {
//   const res = await fetch(
//     `${BASE_URL}/feedback`,
//     {
//       method: "POST",
//       headers: getHeaders(token),
//       body: JSON.stringify(data),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to create feedback");
//   return res.json();
// }

// // Get all feedback (Trainer/Admin)
// export async function fetchFeedback(token, query = {}) {
//   const params = new URLSearchParams(query).toString();

//   const res = await fetch(
//     `${BASE_URL}/feedback${params ? `?${params}` : ""}`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch feedback");
//   return res.json();
// }

// // Get my feedback (Student)
// export async function fetchMyFeedback(token) {
//   const res = await fetch(
//     `${BASE_URL}/feedback/me`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch my feedback");
//   return res.json();
// }

// // Update feedback
// export async function updateFeedback(id, data, token) {
//   const res = await fetch(
//     `${BASE_URL}/feedback/${id}`,
//     {
//       method: "PUT",
//       headers: getHeaders(token),
//       body: JSON.stringify(data),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to update feedback");
//   return res.json();
// }

// // Delete feedback
// export async function deleteFeedback(id, token) {
//   const res = await fetch(
//     `${BASE_URL}/feedback/${id}`,
//     {
//       method: "DELETE",
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to delete feedback");
//   return res.json();
// }






// // Performance //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// // ================================
// // Performance API
// // ================================

// // Get my performance (Student)
// export async function fetchMyPerformance(token) {
//   const res = await fetch(
//     `${BASE_URL}/performance/me`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch my performance");
//   return res.json();
// }

// // Get performance of a specific student (Trainer/Admin)
// export async function fetchStudentPerformance(studentId, token) {
//   const res = await fetch(
//     `${BASE_URL}/performance/${studentId}`,
//     {
//       headers: getHeaders(token),
//     }
//   );

//   if (!res.ok) throw new Error("Failed to fetch student performance");
//   return res.json();
// }







