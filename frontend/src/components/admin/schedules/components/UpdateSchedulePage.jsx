import "./UpdateSchedulePage.css";
import { useState } from "react";


export default function UpdateSchedulePage({

  token,
  onBack,
  schedule,

  AllCourses = [],
  AllSessions = [],
  AllTrainers = [],

  updateSchedule,

}) {



  const [formData, setFormData] = useState({

    courseId:
      schedule?.courseId?._id ||
      schedule?.courseId ||
      "",


    sessionId:
      schedule?.sessionId?._id ||
      schedule?.sessionId ||
      "",


    date:
      schedule?.date ||
      "",


    startTime:
      schedule?.startTime ||
      "",


    endTime:
      schedule?.endTime ||
      "",


    trainerId:
      schedule?.trainerId?._id ||
      schedule?.trainerId ||
      "",


    roomNo:
      schedule?.roomNo ||
      "",


    topic:
      schedule?.topic ||
      "",

  });





  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");





  const handleChange = (field, value) => {


    setFormData(prev => ({

      ...prev,

      [field]: value

    }));


  };








  const validate = () => {


    if (!formData.courseId)
      return "Course is required";


    if (!formData.sessionId)
      return "Session is required";


    if (!formData.date)
      return "Date is required";


    if (!formData.startTime)
      return "Start time is required";


    if (!formData.endTime)
      return "End time is required";


    if (!formData.trainerId)
      return "Trainer is required";


    if (!formData.roomNo)
      return "Room number is required";



    return null;


  };








  const handleSubmit = async () => {


    const validationError =
      validate();



    if (validationError) {

      setError(validationError);
      return;

    }



    try {


      setLoading(true);

      setError("");



      await updateSchedule(

        schedule._id,

        formData,

        token

      );



      alert(
        "Schedule updated successfully"
      );



      onBack();



    }
    catch (err) {


      setError(
        err.message ||
        "Failed updating schedule"
      );


    }
    finally {


      setLoading(false);


    }


  };







  return (

    <div className="update-schedule-page">



      <button

        className="back-btn"

        onClick={onBack}

      >

        ← Back

      </button>





      <h2>
        Update Schedule
      </h2>





      {
        error &&

        <div className="error">

          {error}

        </div>

      }







      <div className="schedule-form">





        {/* Course */}

        <div className="form-group">


          <label>
            Course
          </label>


          <select

            value={formData.courseId}

            onChange={(e) =>
              handleChange(
                "courseId",
                e.target.value
              )
            }

          >


            <option value="">
              Select Course
            </option>



            {
              AllCourses.map(course => (


                <option

                  key={course._id}

                  value={course._id}

                >

                  {course.courseCode}

                </option>


              ))

            }



          </select>


        </div>









        {/* Session */}

        <div className="form-group">


          <label>
            Session
          </label>


          <select


            value={formData.sessionId}


            onChange={(e) =>

              handleChange(
                "sessionId",
                e.target.value
              )

            }


          >


            <option value="">
              Select Session
            </option>



            {
              AllSessions.map(session => (


                <option

                  key={session._id}

                  value={session._id}

                >


                  {
                    new Date(
                      session.startDate
                    )
                      .toLocaleDateString()

                  }

                  {" - "}

                  {
                    new Date(
                      session.endDate
                    )
                      .toLocaleDateString()

                  }


                </option>



              ))

            }


          </select>



        </div>









        {/* Date */}


        <div className="form-group">


          <label>
            Date
          </label>


          <input

            type="date"

            value={formData.date}

            onChange={(e) =>

              handleChange(
                "date",
                e.target.value
              )

            }

          />


        </div>









        <div className="time-grid">



          <div>

            <label>
              Start Time
            </label>


            <input

              type="time"

              value={formData.startTime}

              onChange={(e) =>

                handleChange(
                  "startTime",
                  e.target.value
                )

              }

            />

          </div>





          <div>

            <label>
              End Time
            </label>


            <input

              type="time"

              value={formData.endTime}

              onChange={(e) =>

                handleChange(
                  "endTime",
                  e.target.value
                )

              }

            />


          </div>



        </div>









        {/* Trainer */}


        <div className="form-group">


          <label>
            Trainer
          </label>


          <select


            value={formData.trainerId}


            onChange={(e) =>

              handleChange(
                "trainerId",
                e.target.value
              )

            }


          >


            <option value="">
              Select Trainer
            </option>




            {
              AllTrainers.map(trainer => (


                <option

                  key={trainer._id}

                  value={trainer._id}

                >


                  {trainer.name}


                </option>


              ))

            }



          </select>



        </div>










        {/* Room */}

        <div className="form-group">


          <label>
            Room No
          </label>


          <input

            type="text"

            value={formData.roomNo}

            onChange={(e) =>

              handleChange(
                "roomNo",
                e.target.value
              )

            }

          />


        </div>








        {/* Topic */}

        <div className="form-group">


          <label>
            Topic
          </label>


          <input

            type="text"

            value={formData.topic}

            onChange={(e) =>

              handleChange(
                "topic",
                e.target.value
              )

            }

          />


        </div>










        <button


          className="save-btn"


          onClick={handleSubmit}


          disabled={loading}


        >


          {
            loading
              ?
              "Updating..."
              :
              "Update Schedule"
          }



        </button>





      </div>





    </div>

  );


}











// import "./UpdateSchedulePage.css";
// import { useState } from "react";

// export default function UpdateSchedulePage({
//   token,
//   onBack,
//   schedule,
//   AllCourses = [],
//   AllSessions = [],
//   updateSchedule,
// }) {

//   const [formData, setFormData] = useState({
//     courseId: schedule?.courseId?._id || "",
//     sessionId: schedule?.sessionId?._id || "",
//     slots: {},
//   });


//   const [date, setDate] = useState("");
//   const [slotData, setSlotData] = useState({
//     startTime: "",
//     endTime: "",
//     trainerId: "",
//     roomNo: "",
//     topic: "",
//   });


//   const [loading, setLoading] = useState(false);


//   const handleSlotChange = (field,value)=>{
//     setSlotData(prev=>({
//       ...prev,
//       [field]:value
//     }));
//   };


//   const addSlot = ()=>{

//     if(
//       !date ||
//       !slotData.startTime ||
//       !slotData.endTime ||
//       !slotData.trainerId ||
//       !slotData.roomNo
//     ){
//       alert("Fill all required slot fields");
//       return;
//     }


//     setFormData(prev=>({

//       ...prev,

//       slots:{
//         ...prev.slots,

//         [date]:[
//           ...(prev.slots[date] || []),

//           {
//             startTime:slotData.startTime,
//             endTime:slotData.endTime,
//             trainerId:slotData.trainerId,
//             roomNo:slotData.roomNo,
//             topic:slotData.topic
//           }
//         ]
//       }

//     }));


//     setSlotData({
//       startTime:"",
//       endTime:"",
//       trainerId:"",
//       roomNo:"",
//       topic:""
//     });

//   };



//   const handleSubmit = async()=>{

//     try{

//       setLoading(true);


//       await updateSchedule(
//         schedule._id,
//         formData,
//         token
//       );


//       alert("Schedule updated successfully");

//       onBack();


//     }catch(err){

//       alert(err.message);

//     }
//     finally{

//       setLoading(false);

//     }

//   };




//   return (

//     <div className="update-schedule-page">

//       schedule
//        <pre>{JSON.stringify(schedule, null, 2)}</pre>

//       <button onClick={onBack}>
//         ← Back
//       </button>


//       <h2>
//         Update Schedule
//       </h2>



//       <div className="schedule-form">


//         <div className="form-group">

//           <label>
//             Course
//           </label>


//           <select

//             value={formData.courseId}

//             onChange={(e)=>
//               setFormData(prev=>({
//                 ...prev,
//                 courseId:e.target.value
//               }))
//             }

//           >

//             <option value="">
//               Select Course
//             </option>


//             {
//               AllCourses.map(course=>(

//                 <option
//                   key={course._id}
//                   value={course._id}
//                 >
//                   {course.courseCode}
//                 </option>

//               ))
//             }


//           </select>


//         </div>





//         <div className="form-group">

//           <label>
//             Session
//           </label>


//           <select

//             value={formData.sessionId}

//             onChange={(e)=>
//               setFormData(prev=>({
//                 ...prev,
//                 sessionId:e.target.value
//               }))
//             }

//           >

//             <option value="">
//               Select Session
//             </option>


//             {
//               AllSessions.map(session=>(

//                 <option
//                   key={session._id}
//                   value={session._id}
//                 >

//                 {
//                   new Date(session.startDate)
//                   .toLocaleDateString()
//                 }

//                 {" - "}

//                 {
//                   new Date(session.endDate)
//                   .toLocaleDateString()
//                 }


//                 </option>

//               ))
//             }


//           </select>


//         </div>





//         <h3>
//           Add Slot
//         </h3>



//         <input
//           type="date"
//           value={date}
//           onChange={(e)=>setDate(e.target.value)}
//         />



//         <input
//           type="time"
//           placeholder="Start Time"
//           value={slotData.startTime}
//           onChange={(e)=>
//             handleSlotChange(
//               "startTime",
//               e.target.value
//             )
//           }
//         />



//         <input
//           type="time"
//           placeholder="End Time"
//           value={slotData.endTime}
//           onChange={(e)=>
//             handleSlotChange(
//               "endTime",
//               e.target.value
//             )
//           }
//         />



//         <input
//           type="text"
//           placeholder="Trainer ID"
//           value={slotData.trainerId}
//           onChange={(e)=>
//             handleSlotChange(
//               "trainerId",
//               e.target.value
//             )
//           }
//         />



//         <input
//           type="text"
//           placeholder="Room No"
//           value={slotData.roomNo}
//           onChange={(e)=>
//             handleSlotChange(
//               "roomNo",
//               e.target.value
//             )
//           }
//         />



//         <input
//           type="text"
//           placeholder="Topic (optional)"
//           value={slotData.topic}
//           onChange={(e)=>
//             handleSlotChange(
//               "topic",
//               e.target.value
//             )
//           }
//         />



//         <button
//           type="button"
//           onClick={addSlot}
//         >
//           + Add Slot
//         </button>





//         <button
//           className="save-btn"
//           onClick={handleSubmit}
//           disabled={loading}
//         >

//         {
//           loading
//           ? "Updating..."
//           : "Update Schedule"
//         }

//         </button>


//       </div>


//     </div>

//   );

// }