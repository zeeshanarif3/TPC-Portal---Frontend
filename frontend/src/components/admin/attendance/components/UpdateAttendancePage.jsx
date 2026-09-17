import "./UpdateAttendancePage.css";
import { useEffect, useState } from "react";

export default function UpdateAttendancePage({
  token,
  onBack,
  attendance,
  AllStudents = [],
  updateAttendance,
}) {
  const [formData, setFormData] = useState({
    presentStudents: [],
    attendanceTaken: true,
    feedback: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (attendance) {
      setFormData({
        presentStudents: attendance.presentStudents || [],
        attendanceTaken:
          attendance.attendanceTaken !== undefined
            ? attendance.attendanceTaken
            : true,
        feedback: attendance.feedback || "",
      });
    }
  }, [attendance]);

  const toggleStudent = (studentId) => {
    setFormData((prev) => ({
      ...prev,

      presentStudents: prev.presentStudents.includes(studentId)
        ? prev.presentStudents.filter((id) => id !== studentId)
        : [...prev.presentStudents, studentId],
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!attendance?._id) {
        throw new Error("Slot ID is missing");
      }

      const attendanceData = {
        presentStudents: formData.presentStudents,
        headCount: formData.presentStudents.length,
        attendanceTaken: formData.attendanceTaken,
        feedback: formData.feedback,
      };

      await updateAttendance(
        attendance._id,
        attendanceData,
        token
      );

      alert("Attendance updated successfully");

      onBack();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-attendance-page">

      <button onClick={onBack}>
        ← Back
      </button>

      <h2>
        Update Attendance
      </h2>

      <div className="attendance-form">

        {/* Slot Information */}

        <div className="form-group">
          <label>
            Date
          </label>

          <input
            type="text"
            value={
              attendance?.date
                ? new Date(attendance.date).toLocaleDateString()
                : ""
            }
            disabled
          />
        </div>

        <div className="form-group">
          <label>
            Start Time
          </label>

          <input
            type="text"
            value={attendance?.startTime || ""}
            disabled
          />
        </div>

        <div className="form-group">
          <label>
            End Time
          </label>

          <input
            type="text"
            value={attendance?.endTime || ""}
            disabled
          />
        </div>

        {/* Attendance */}

        <div className="form-group">

          <label>
            Present Students
          </label>

          <div className="student-list">

            {AllStudents.map((student) => (
              <label key={student._id}>

                <input
                  type="checkbox"
                  checked={formData.presentStudents.includes(
                    student._id
                  )}
                  onChange={() =>
                    toggleStudent(student._id)
                  }
                />

                {student.name}

              </label>
            ))}

          </div>

        </div>

        {/* Head Count */}

        <div className="form-group">

          <label>
            Head Count
          </label>

          <input
            type="number"
            value={formData.presentStudents.length}
            disabled
          />

        </div>

        {/* Attendance Taken */}

        <div className="form-group">

          <label>
            Attendance Status
          </label>

          <select
            value={formData.attendanceTaken ? "true" : "false"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                attendanceTaken: e.target.value === "true",
              }))
            }
          >
            <option value="true">
              Attendance Taken
            </option>

            <option value="false">
              Attendance Not Taken
            </option>
          </select>

        </div>

        {/* Feedback */}

        <div className="form-group">

          <label>
            Feedback
          </label>

          <textarea
            value={formData.feedback}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                feedback: e.target.value,
              }))
            }
            placeholder="Enter feedback..."
          />

        </div>

        <button
          className="save-btn"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading
            ? "Updating..."
            : "Update Attendance"}
        </button>

      </div>

    </div>
  );
}










// import "./UpdateAttendancePage.css";
// import { useDashboard } from "../../../../hooks/useDashboard";
// import { useEffect, useState } from "react";

// import './UpdateAttendancePage.css'

// export default function UpdateAttendancePage({
//   token,
//   onBack,
//   attendance,
//   AllStudents = [],
//   updateAttendance,
// }) {




//   const [formData,setFormData] = useState({

//     courseId:"",
//     sessionId:"",
//     date:"",
//     startTime:"",
//     endTime:"",
//     presentStudents:[]

//   });



//   const [loading,setLoading] = useState(false);



//   useEffect(()=>{

//     if(attendance){

//       setFormData({

//         courseId:
//           attendance.courseId?._id ||
//           attendance.courseId ||
//           "",


//         sessionId:
//           attendance.sessionId?._id ||
//           attendance.sessionId ||
//           "",


//         date:
//           attendance.date
//           ? attendance.date.split("T")[0]
//           : "",


//         startTime:
//           attendance.startTime || "",


//         endTime:
//           attendance.endTime || "",


//         presentStudents:
//           attendance.presentStudents || []

//       });

//     }


//   },[attendance]);





//   const handleChange=(field,value)=>{

//     setFormData(prev=>({

//       ...prev,
//       [field]:value

//     }));

//   };






//   const toggleStudent=(studentId)=>{


//     setFormData(prev=>({

//       ...prev,


//       presentStudents:

//         prev.presentStudents.includes(studentId)

//         ?

//         prev.presentStudents.filter(
//           id=>id!==studentId
//         )

//         :

//         [
//           ...prev.presentStudents,
//           studentId
//         ]


//     }));

//   };







//   const handleSubmit=async()=>{


//     try{


//       setLoading(true);



//       await updateAttendance(
//         formData,
//         token
//       );



//       alert("Attendance updated successfully");

//       onBack();



//     }catch(err){

//       alert(err.message);

//     }
//     finally{

//       setLoading(false);

//     }


//   };







//   return (

//     <div className="update-attendance-page">


//       <button onClick={onBack}>
//         ← Back
//       </button>



//       <h2>
//         Update Attendance
//       </h2>




//       <div className="attendance-form">





//         <div className="form-group">

//           <label>
//             Date
//           </label>


//           <input

//             type="date"

//             value={formData.date}

//             onChange={(e)=>
//               handleChange(
//                 "date",
//                 e.target.value
//               )
//             }

//           />

//         </div>





//         <div className="form-group">

//           <label>
//             Start Time
//           </label>


//           <input

//             type="time"

//             value={formData.startTime}

//             onChange={(e)=>
//               handleChange(
//                 "startTime",
//                 e.target.value
//               )
//             }

//           />

//         </div>





//         <div className="form-group">

//           <label>
//             End Time
//           </label>


//           <input

//             type="time"

//             value={formData.endTime}

//             onChange={(e)=>
//               handleChange(
//                 "endTime",
//                 e.target.value
//               )
//             }

//           />

//         </div>





//         <div className="form-group">

//           <label>
//             Present Students
//           </label>



//           <div className="student-list">


//           {
//             AllStudents.map(student=>(

//               <label key={student._id}>


//                 <input

//                   type="checkbox"

//                   checked={
//                     formData.presentStudents.includes(
//                       student._id
//                     )
//                   }


//                   onChange={()=>
//                     toggleStudent(
//                       student._id
//                     )
//                   }


//                 />


//                 {student.name}


//               </label>


//             ))
//           }


//           </div>


//         </div>





//         <button

//           className="save-btn"

//           disabled={loading}

//           onClick={handleSubmit}

//         >

//           {
//             loading
//             ?
//             "Updating..."
//             :
//             "Update Attendance"
//           }


//         </button>



//       </div>


//     </div>

//   );

// }