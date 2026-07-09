import "./UpdateSessionPage.css";
import { useEffect, useState } from "react";

export default function UpdateSessionPage({
  token,
  onBack,
  session,
  AllColleges = [],
  AllCourses = [],
  updateSession,
}) {


  const [formData, setFormData] = useState({
    collegeId: "",
    courseIds: [],
    startDate: "",
    endDate: "",
  });


  const [loading, setLoading] = useState(false);



  useEffect(() => {

    if (session) {

      setFormData({

        collegeId:
          session.collegeId?._id ||
          session.collegeId ||
          "",


        courseIds:
          session.courseIds?.map(course =>
            course._id || course
          ) || [],


        startDate:
          session.startDate
            ? session.startDate.split("T")[0]
            : "",


        endDate:
          session.endDate
            ? session.endDate.split("T")[0]
            : "",

      });

    }

  }, [session]);





  // Filter courses according to selected college
  const filteredCourses = AllCourses.filter(course => {

    const courseCollegeId =
      course.collegeId?._id ||
      course.collegeId;


    return (
      courseCollegeId === formData.collegeId
    );

  });





  const handleCourseChange = (courseId) => {

    setFormData(prev => ({

      ...prev,

      courseIds:

        prev.courseIds.includes(courseId)

          ?

          prev.courseIds.filter(
            id => id !== courseId
          )

          :

          [
            ...prev.courseIds,
            courseId
          ]

    }));

  };





  const handleCollegeChange = (collegeId) => {

    setFormData(prev => ({

      ...prev,

      collegeId,

      // remove courses from previous college
      courseIds: []

    }));

  };





  const handleChange = (field, value) => {

    setFormData(prev => ({

      ...prev,

      [field]: value

    }));

  };





  const handleSubmit = async () => {


    if (!session?._id) {

      alert("Session data missing");
      return;

    }



    try {

      setLoading(true);


      await updateSession(
        session._id,
        formData,
        token
      );


      alert(
        "Session updated successfully"
      );


      onBack();



    } catch (err) {

      alert(err.message);

    }
    finally {

      setLoading(false);

    }

  };






  return (

    <div className="update-session-page">


      <button onClick={onBack}>
        ← Back
      </button>



      <h2>
        Update Session
      </h2>





      <div className="session-form">



        {/* College */}

        <div className="form-group">

          <label>
            College
          </label>


          <select

            value={formData.collegeId}

            onChange={(e)=>
              handleCollegeChange(
                e.target.value
              )
            }

          >

            <option value="">
              Select College
            </option>


            {
              AllColleges.map(college => (

                <option

                  key={college._id}

                  value={college._id}

                >

                  {college.name}

                </option>

              ))
            }


          </select>


        </div>







        {/* Courses */}

        <div className="form-group">

          <label>
            Courses
          </label>


          <div className="course-checkboxes">


            {
              !formData.collegeId ?

              (

                <p>
                  Select college first
                </p>

              )

              :

              filteredCourses.length === 0 ?

              (

                <p>
                  No courses available
                </p>

              )

              :

              (

                filteredCourses.map(course => (

                  <label
                    key={course._id}
                  >


                    <input

                      type="checkbox"

                      checked={
                        formData.courseIds.includes(
                          course._id
                        )
                      }


                      onChange={() =>
                        handleCourseChange(
                          course._id
                        )
                      }

                    />


                    {course.courseCode}


                  </label>

                ))

              )

            }


          </div>


        </div>







        {/* Start Date */}

        <div className="form-group">

          <label>
            Start Date
          </label>


          <input

            type="date"

            value={
              formData.startDate
            }


            onChange={(e)=>
              handleChange(
                "startDate",
                e.target.value
              )
            }

          />


        </div>







        {/* End Date */}

        <div className="form-group">

          <label>
            End Date
          </label>


          <input

            type="date"

            value={
              formData.endDate
            }


            onChange={(e)=>
              handleChange(
                "endDate",
                e.target.value
              )
            }

          />


        </div>







        <button

          className="save-btn"

          disabled={loading}

          onClick={handleSubmit}

        >

          {
            loading
              ? "Updating..."
              : "Update Session"
          }


        </button>



      </div>


    </div>

  );

}








// import "./UpdateSessionPage.css";
// import { useDashboard } from "../../../../hooks/useDashboard";
// import { useEffect, useState } from "react";

// export default function UpdateSessionPage({
//   token,
//   onBack,
//   session,
//   AllColleges = [],
//   AllCourses = [],
//   updateSession,
// }) {


//   const [formData, setFormData] = useState({
//     collegeId: "",
//     courseIds: [],
//     startDate: "",
//     endDate: "",
//   });


//   const [loading, setLoading] = useState(false);



//   useEffect(() => {

//     if(session){

//       setFormData({

//         collegeId:
//           session.collegeId?._id ||
//           session.collegeId ||
//           "",


//         courseIds:
//           session.courseIds?.map(course =>
//             course._id || course
//           ) || [],


//         startDate:
//           session.startDate
//           ? session.startDate.split("T")[0]
//           : "",


//         endDate:
//           session.endDate
//           ? session.endDate.split("T")[0]
//           : "",

//       });

//     }

//   },[session]);




//   const handleChange=(field,value)=>{

//     setFormData(prev=>({
//       ...prev,
//       [field]:value
//     }));

//   };




//   const handleCourseChange=(courseId)=>{

//     setFormData(prev=>({

//       ...prev,

//       courseIds:
//         prev.courseIds.includes(courseId)

//         ? prev.courseIds.filter(
//             id=>id!==courseId
//           )

//         : [
//             ...prev.courseIds,
//             courseId
//           ]

//     }));

//   };





//   const handleSubmit=async()=>{


//     if(!session?._id){

//       alert("Session data missing");
//       return;

//     }


//     try{


//       setLoading(true);


//       await updateSession(
//         session._id,
//         formData,
//         token
//       );


//       alert("Session updated successfully");

//       onBack();



//     }catch(err){

//       alert(err.message);

//     }
//     finally{

//       setLoading(false);

//     }

//   };





//   return (

//     <div className="update-session-page">


//       <button onClick={onBack}>
//         ← Back
//       </button>



//       <h2>
//         Update Session
//       </h2>




//       <div className="session-form">



//         <div className="form-group">

//           <label>
//             College
//           </label>


//           <select

//             value={formData.collegeId}

//             onChange={(e)=>
//               handleChange(
//                 "collegeId",
//                 e.target.value
//               )
//             }

//           >

//             <option value="">
//               Select College
//             </option>


//             {
//               AllColleges.map(college=>(

//                 <option
//                   key={college._id}
//                   value={college._id}
//                 >

//                   {college.name}

//                 </option>

//               ))
//             }


//           </select>


//         </div>





//         <div className="form-group">

//           <label>
//             Courses
//           </label>


//           <div className="course-checkboxes">


//           {
//             AllCourses
//             .filter(course =>
//               course.collegeId === formData.collegeId ||
//               course.collegeId?._id === formData.collegeId
//             )
//             .map(course=>(

//               <label key={course._id}>


//                 <input

//                   type="checkbox"

//                   checked={
//                     formData.courseIds.includes(
//                       course._id
//                     )
//                   }

//                   onChange={()=>
//                     handleCourseChange(
//                       course._id
//                     )
//                   }

//                 />


//                 {course.courseCode}


//               </label>

//             ))
//           }


//           </div>


//         </div>





//         <div className="form-group">

//           <label>
//             Start Date
//           </label>


//           <input

//             type="date"

//             value={formData.startDate}

//             onChange={(e)=>
//               handleChange(
//                 "startDate",
//                 e.target.value
//               )
//             }

//           />

//         </div>





//         <div className="form-group">

//           <label>
//             End Date
//           </label>


//           <input

//             type="date"

//             value={formData.endDate}

//             onChange={(e)=>
//               handleChange(
//                 "endDate",
//                 e.target.value
//               )
//             }

//           />

//         </div>





//         <button

//           className="save-btn"

//           disabled={loading}

//           onClick={handleSubmit}

//         >

//           {
//             loading
//             ? "Updating..."
//             : "Update Session"
//           }


//         </button>



//       </div>


//     </div>

//   );

// }