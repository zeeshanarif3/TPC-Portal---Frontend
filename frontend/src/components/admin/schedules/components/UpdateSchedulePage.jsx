import "./UpdateSchedulePage.css";
import { useState } from "react";

export default function UpdateSchedulePage({
  token,
  onBack,
  schedule,
  AllCourses = [],
  AllSessions = [],
  updateSchedule,
}) {

  const [formData, setFormData] = useState({
    courseId: schedule?.courseId?._id || "",
    sessionId: schedule?.sessionId?._id || "",
    slots: {},
  });


  const [date, setDate] = useState("");
  const [slotData, setSlotData] = useState({
    startTime: "",
    endTime: "",
    trainerId: "",
    roomNo: "",
    topic: "",
  });


  const [loading, setLoading] = useState(false);


  const handleSlotChange = (field,value)=>{
    setSlotData(prev=>({
      ...prev,
      [field]:value
    }));
  };


  const addSlot = ()=>{

    if(
      !date ||
      !slotData.startTime ||
      !slotData.endTime ||
      !slotData.trainerId ||
      !slotData.roomNo
    ){
      alert("Fill all required slot fields");
      return;
    }


    setFormData(prev=>({

      ...prev,

      slots:{
        ...prev.slots,

        [date]:[
          ...(prev.slots[date] || []),

          {
            startTime:slotData.startTime,
            endTime:slotData.endTime,
            trainerId:slotData.trainerId,
            roomNo:slotData.roomNo,
            topic:slotData.topic
          }
        ]
      }

    }));


    setSlotData({
      startTime:"",
      endTime:"",
      trainerId:"",
      roomNo:"",
      topic:""
    });

  };



  const handleSubmit = async()=>{

    try{

      setLoading(true);


      await updateSchedule(
        schedule._id,
        formData,
        token
      );


      alert("Schedule updated successfully");

      onBack();


    }catch(err){

      alert(err.message);

    }
    finally{

      setLoading(false);

    }

  };




  return (

    <div className="update-schedule-page">


      <button onClick={onBack}>
        ← Back
      </button>


      <h2>
        Update Schedule
      </h2>



      <div className="schedule-form">


        <div className="form-group">

          <label>
            Course
          </label>


          <select

            value={formData.courseId}

            onChange={(e)=>
              setFormData(prev=>({
                ...prev,
                courseId:e.target.value
              }))
            }

          >

            <option value="">
              Select Course
            </option>


            {
              AllCourses.map(course=>(

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





        <div className="form-group">

          <label>
            Session
          </label>


          <select

            value={formData.sessionId}

            onChange={(e)=>
              setFormData(prev=>({
                ...prev,
                sessionId:e.target.value
              }))
            }

          >

            <option value="">
              Select Session
            </option>


            {
              AllSessions.map(session=>(

                <option
                  key={session._id}
                  value={session._id}
                >

                {
                  new Date(session.startDate)
                  .toLocaleDateString()
                }

                {" - "}

                {
                  new Date(session.endDate)
                  .toLocaleDateString()
                }


                </option>

              ))
            }


          </select>


        </div>





        <h3>
          Add Slot
        </h3>



        <input
          type="date"
          value={date}
          onChange={(e)=>setDate(e.target.value)}
        />



        <input
          type="time"
          placeholder="Start Time"
          value={slotData.startTime}
          onChange={(e)=>
            handleSlotChange(
              "startTime",
              e.target.value
            )
          }
        />



        <input
          type="time"
          placeholder="End Time"
          value={slotData.endTime}
          onChange={(e)=>
            handleSlotChange(
              "endTime",
              e.target.value
            )
          }
        />



        <input
          type="text"
          placeholder="Trainer ID"
          value={slotData.trainerId}
          onChange={(e)=>
            handleSlotChange(
              "trainerId",
              e.target.value
            )
          }
        />



        <input
          type="text"
          placeholder="Room No"
          value={slotData.roomNo}
          onChange={(e)=>
            handleSlotChange(
              "roomNo",
              e.target.value
            )
          }
        />



        <input
          type="text"
          placeholder="Topic (optional)"
          value={slotData.topic}
          onChange={(e)=>
            handleSlotChange(
              "topic",
              e.target.value
            )
          }
        />



        <button
          type="button"
          onClick={addSlot}
        >
          + Add Slot
        </button>





        <button
          className="save-btn"
          onClick={handleSubmit}
          disabled={loading}
        >

        {
          loading
          ? "Updating..."
          : "Update Schedule"
        }

        </button>


      </div>


    </div>

  );

}