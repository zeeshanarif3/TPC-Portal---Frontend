import "./NewSchedulePage.css";
import { useState } from "react";

export default function NewSchedulePage({
    token,
    onBack,
    AllCourses = [],
    AllSessions = [],
    AllTrainers = [],
    createSchedule,
}) {
    const [courseId, setCourseId] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [date, setDate] = useState("");

    const [slot, setSlot] = useState({
        startTime: "",
        endTime: "",
        trainerId: "",
        roomNo: "",
        topic: ""
    });

    const [slots, setSlots] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSlotChange = (e) => {
        setSlot((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const addSlot = () => {
        setError("");
        setSuccess("");

        if (!date) {
            setError("Date is required");
            return;
        }

        if (
            !slot.startTime ||
            !slot.endTime ||
            !slot.trainerId ||
            !slot.roomNo
        ) {
            setError("Start time, end time, trainer and room are required");
            return;
        }

        if (slot.startTime >= slot.endTime) {
            setError("End time must be after start time");
            return;
        }

        const duplicate = slots.some((existing) =>
            existing.startTime === slot.startTime &&
            existing.endTime === slot.endTime &&
            existing.roomNo === slot.roomNo
        );

        if (duplicate) {
            setError("This room is already booked for this time");
            return;
        }

        setSlots((prev) => [
            ...prev,
            {
                startTime: slot.startTime,
                endTime: slot.endTime,
                trainerId: slot.trainerId,
                roomNo: slot.roomNo,
                topic: slot.topic || ""
            }
        ]);

        setSlot({
            startTime: "",
            endTime: "",
            trainerId: "",
            roomNo: "",
            topic: ""
        });
    };

    const removeSlot = (index) => {
        setSlots((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!courseId || !sessionId) {
            setError("Course and session are required");
            return;
        }

        if (!date) {
            setError("Date is required");
            return;
        }

        if (slots.length === 0) {
            setError("Add at least one slot");
            return;
        }

        const selectedSession = AllSessions.find((s) => s._id === sessionId);

        if (!selectedSession) {
            setError("Session not found");
            return;
        }

        try {
            setLoading(true);

            const promises = slots.map((item) => {
                const payload = {
                    courseId,
                    sessionId,
                    date,
                    startTime: item.startTime,
                    endTime: item.endTime,
                    trainerId: item.trainerId,
                    roomNo: item.roomNo,
                    topic: item.topic
                };

                console.log("CREATE SCHEDULE:", payload);

                return createSchedule(payload, token);
            });

            await Promise.all(promises);

            setSuccess("Schedule created successfully");
            setCourseId("");
            setSessionId("");
            setDate("");
            setSlots([]);
            setSlot({
                startTime: "",
                endTime: "",
                trainerId: "",
                roomNo: "",
                topic: ""
            });
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed creating schedule");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-schedule-page">
            <button className="back-btn" onClick={onBack}>
                ← Back
            </button>

            <h2>Create New Schedule</h2>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Course</label>
                    <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        required
                    >
                        <option value="">Select Course</option>
                        {AllCourses.map((course) => (
                            <option key={course._id} value={course._id}>
                                {course.courseCode}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Session</label>
                    <select
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                        required
                    >
                        <option value="">Select Session</option>
                        {AllSessions.map((session) => (
                            <option key={session._id} value={session._id}>
                                {new Date(session.startDate).toLocaleDateString()} -{" "}
                                {new Date(session.endDate).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <hr />

                <h3>Add Time Slot</h3>

                <div className="slot-grid">
                    <input
                        type="time"
                        name="startTime"
                        value={slot.startTime}
                        onChange={handleSlotChange}
                    />

                    <input
                        type="time"
                        name="endTime"
                        value={slot.endTime}
                        onChange={handleSlotChange}
                    />

                    <select
                        name="trainerId"
                        value={slot.trainerId}
                        onChange={handleSlotChange}
                    >
                        <option value="">Select Trainer</option>
                        {AllTrainers.map((trainer) => (
                            <option key={trainer._id} value={trainer._id}>
                                {trainer.name}
                            </option>
                        ))}
                    </select>

                    <input
                        name="roomNo"
                        placeholder="Room No"
                        value={slot.roomNo}
                        onChange={handleSlotChange}
                    />

                    <input
                        name="topic"
                        placeholder="Topic"
                        value={slot.topic}
                        onChange={handleSlotChange}
                    />
                </div>

                <button type="button" onClick={addSlot}>
                    + Add Slot
                </button>

                <div className="added-slots">
                    {slots.map((item, index) => (
                        <div className="slot-card" key={index}>
                            <span>
                                {item.startTime} - {item.endTime}
                            </span>

                            <span>
                                {
                                    AllTrainers.find(
                                        (t) => t._id === item.trainerId
                                    )?.name
                                }
                            </span>

                            <span>Room: {item.roomNo}</span>

                            {item.topic && <span>Topic: {item.topic}</span>}

                            <button
                                type="button"
                                onClick={() => removeSlot(index)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <button className="submit-btn" disabled={loading}>
                    {loading ? "Creating..." : "Create Schedule"}
                </button>
            </form>
        </div>
    );
}






// import "./NewSchedulePage.css";
// import { useState } from "react";


// export default function NewSchedulePage({
//     token,
//     onBack,
//     AllCourses = [],
//     AllSessions = [],
//     AllTrainers = [],
//     createSchedule,
// }) {


//     const days = [
//         "monday",
//         "tuesday",
//         "wednesday",
//         "thursday",
//         "friday",
//         "saturday"
//     ];


//     const [courseId, setCourseId] = useState("");
//     const [sessionId, setSessionId] = useState("");

//     const [selectedDay, setSelectedDay] = useState("monday");


//     const [slot, setSlot] = useState({

//         startTime:"",
//         endTime:"",
//         trainerId:"",
//         roomNo:"",
//         topic:""

//     });


//     const [slots,setSlots] = useState({});


//     const [error,setError] = useState("");
//     const [success,setSuccess] = useState("");



//     function handleSlotChange(e){

//         setSlot({
//             ...slot,
//             [e.target.name]:e.target.value
//         });

//     }




//     function addSlot(){


//         if(
//             !slot.startTime ||
//             !slot.endTime ||
//             !slot.trainerId ||
//             !slot.roomNo
//         ){

//             setError(
//                 "Start time, end time, trainer and room are required"
//             );

//             return;
//         }



//         setSlots(prev=>({

//             ...prev,

//             [selectedDay]:[
//                 ...(prev[selectedDay] || []),

//                 {
//                     startTime:slot.startTime,
//                     endTime:slot.endTime,
//                     trainerId:slot.trainerId,
//                     roomNo:slot.roomNo,
//                     topic:slot.topic
//                 }
//             ]

//         }));


//         setSlot({

//             startTime:"",
//             endTime:"",
//             trainerId:"",
//             roomNo:"",
//             topic:""

//         });


//         setError("");

//     }





//     function removeSlot(day,index){


//         setSlots(prev=>({

//             ...prev,

//             [day]:
//                 prev[day].filter(
//                     (_,i)=>i!==index
//                 )

//         }));

//     }





//     async function handleSubmit(e){

//         e.preventDefault();


//         try{


//             setError("");
//             setSuccess("");



//             const payload={

//                 courseId,
//                 sessionId,
//                 slots

//             };


//             console.log(
//                 "Schedule Payload:",
//                 JSON.stringify(payload,null,2)
//             );



//             await createSchedule(
//                 payload,
//                 token
//             );



//             setSuccess(
//                 "Schedule created successfully"
//             );


//             setCourseId("");
//             setSessionId("");
//             setSlots({});


//         }
//         catch(err){

//             console.error(err);

//             setError(
//                 err.message ||
//                 "Failed creating schedule"
//             );

//         }

//     }





//     return (

//         <div className="new-schedule-page">


//             <button
//                 className="back-btn"
//                 onClick={onBack}
//             >
//                 ← Back
//             </button>



//             <h2>
//                 Create New Schedule
//             </h2>




//             {
//                 error &&
//                 <div className="error">
//                     {error}
//                 </div>
//             }



//             {
//                 success &&
//                 <div className="success">
//                     {success}
//                 </div>
//             }




//             <form
//                 onSubmit={handleSubmit}
//             >


//                 <div className="form-group">

//                     <label>
//                         Course
//                     </label>


//                     <select
//                         value={courseId}
//                         onChange={
//                             e=>setCourseId(e.target.value)
//                         }
//                         required
//                     >

//                         <option value="">
//                             Select Course
//                         </option>


//                         {
//                             AllCourses.map(course=>(

//                                 <option
//                                     key={course._id}
//                                     value={course._id}
//                                 >
//                                     {
//                                         course.courseCode
//                                     }
//                                 </option>

//                             ))
//                         }


//                     </select>

//                 </div>





//                 <div className="form-group">

//                     <label>
//                         Session
//                     </label>


//                     <select

//                         value={sessionId}

//                         onChange={
//                             e=>setSessionId(e.target.value)
//                         }

//                         required

//                     >

//                         <option value="">
//                             Select Session
//                         </option>



//                         {
//                             AllSessions.map(session=>(

//                                 <option
//                                     key={session._id}
//                                     value={session._id}
//                                 >

//                                     {
//                                         new Date(
//                                             session.startDate
//                                         )
//                                         .toLocaleDateString()
//                                     }

//                                     {" - "}

//                                     {
//                                         new Date(
//                                             session.endDate
//                                         )
//                                         .toLocaleDateString()
//                                     }

//                                 </option>

//                             ))
//                         }


//                     </select>


//                 </div>





//                 <hr />



//                 <h3>
//                     Add Time Slot
//                 </h3>




//                 <div className="form-group">


//                     <label>
//                         Day
//                     </label>


//                     <select

//                         value={selectedDay}

//                         onChange={
//                             e=>setSelectedDay(e.target.value)
//                         }

//                     >

//                         {
//                             days.map(day=>(

//                                 <option
//                                     key={day}
//                                     value={day}
//                                 >
//                                     {
//                                         day.toUpperCase()
//                                     }
//                                 </option>

//                             ))
//                         }

//                     </select>


//                 </div>





//                 <div className="slot-grid">


//                     <input

//                         type="time"

//                         name="startTime"

//                         value={slot.startTime}

//                         onChange={handleSlotChange}

//                     />



//                     <input

//                         type="time"

//                         name="endTime"

//                         value={slot.endTime}

//                         onChange={handleSlotChange}

//                     />



//                     <select

//                         name="trainerId"

//                         value={slot.trainerId}

//                         onChange={handleSlotChange}

//                     >

//                         <option value="">
//                             Select Trainer
//                         </option>


//                         {
//                             AllTrainers.map(trainer=>(

//                                 <option

//                                     key={trainer._id}

//                                     value={trainer._id}

//                                 >

//                                     {
//                                         trainer.name
//                                     }

//                                 </option>

//                             ))
//                         }

//                     </select>




//                     <input

//                         name="roomNo"

//                         placeholder="Room No"

//                         value={slot.roomNo}

//                         onChange={handleSlotChange}

//                     />



//                     <input

//                         name="topic"

//                         placeholder="Topic"

//                         value={slot.topic}

//                         onChange={handleSlotChange}

//                     />



//                 </div>




//                 <button

//                     type="button"

//                     onClick={addSlot}

//                 >

//                     + Add Slot

//                 </button>





//                 <div className="added-slots">


//                     {
//                         Object.entries(slots)
//                         .map(([day,list])=>(


//                             <div
//                                 key={day}
//                             >

//                                 <h4>
//                                     {day.toUpperCase()}
//                                 </h4>


//                                 {
//                                     list.map(
//                                         (item,index)=>(

//                                         <div
//                                             className="slot-card"
//                                             key={index}
//                                         >

//                                             <span>
//                                                 {item.startTime}
//                                                 {" - "}
//                                                 {item.endTime}
//                                             </span>


//                                             <span>
//                                                 {
//                                                     AllTrainers.find(
//                                                         t=>t._id===item.trainerId
//                                                     )?.name
//                                                 }
//                                             </span>


//                                             <span>
//                                                 Room:
//                                                 {item.roomNo}
//                                             </span>



//                                             <button

//                                                 type="button"

//                                                 onClick={()=>
//                                                     removeSlot(
//                                                         day,
//                                                         index
//                                                     )
//                                                 }

//                                             >
//                                                 Remove
//                                             </button>


//                                         </div>

//                                     ))
//                                 }


//                             </div>


//                         ))
//                     }


//                 </div>




//                 <button

//                     className="submit-btn"

//                     type="submit"

//                 >

//                     Create Schedule

//                 </button>



//             </form>


//         </div>

//     );

// }

















// // after this the made was new from scratch

// // import "./NewSchedulePage.css";
// // import { useDashboard } from "../../../../hooks/useDashboard";
// // import { useState } from "react";
// // import Papa from "papaparse";


// // export default function NewSchedulePage({
// //     token,
// //     onBack,
// //     AllCourses = [],
// //     AllSessions = [],
// //     AllTrainers = [],
// //     createSchedule,
// //     appendSlotsViaCSV
// // }) {




// //     const [mode, setMode] = useState("manual");



// //     const [formData, setFormData] = useState({
// //         courseId: "",
// //         sessionId: "",
// //         slots: {}
// //     });



// //     const [slot, setSlot] = useState({

// //         date: "",
// //         startTime: "",
// //         endTime: "",
// //         trainerId: "",
// //         roomNo: "",
// //         topic: ""

// //     });



// //     const [csvRows, setCsvRows] = useState([]);
// //     const [csvData, setCsvData] = useState({
// //         courseId: "",
// //         sessionId: ""
// //     });



// //     const [loading, setLoading] = useState(false);



// //     const handleChange = (field, value) => {

// //         setFormData(prev => ({
// //             ...prev,
// //             [field]: value
// //         }));

// //     };




// //     const addSlot = () => {


// //         if (
// //             !slot.date ||
// //             !slot.startTime ||
// //             !slot.endTime ||
// //             !slot.trainerId ||
// //             !slot.roomNo
// //         ) {

// //             alert("Fill all slot details");
// //             return;

// //         }



// //         setFormData(prev => ({

// //             ...prev,

// //             slots: {

// //                 ...prev.slots,

// //                 [slot.date]: [

// //                     ...(prev.slots[slot.date] || []),

// //                     {
// //                         startTime: slot.startTime,
// //                         endTime: slot.endTime,
// //                         trainerId: slot.trainerId,
// //                         roomNo: slot.roomNo,
// //                         topic: slot.topic
// //                     }

// //                 ]

// //             }

// //         }));


// //         setSlot({
// //             date: "",
// //             startTime: "",
// //             endTime: "",
// //             trainerId: "",
// //             roomNo: "",
// //             topic: ""
// //         });


// //     };





// //     const handleCSV = (file) => {


// //         Papa.parse(file, {

// //             header: true,
// //             skipEmptyLines: true,

// //             complete: (result) => {

// //                 setCsvRows(result.data);

// //             }

// //         });


// //     };






// //     const submitManual = async () => {


// //         try {

// //             setLoading(true);


// //             await createSchedule(
// //                 formData,
// //                 token
// //             );


// //             alert("Schedule created");

// //             onBack();


// //         }
// //         catch (err) {

// //             alert(err.message);

// //         }
// //         finally {

// //             setLoading(false);

// //         }


// //     };







// //     // const submitCSV = async()=>{


// //     //     if(csvRows.length===0){

// //     //         alert("Upload CSV first");
// //     //         return;

// //     //     }



// //     //     try{


// //     //         setLoading(true);



// //     //         await appendSlotsViaCSV(
// //     //             csvRows,
// //     //             token
// //     //         );



// //     //         alert("Slots added successfully");

// //     //         onBack();



// //     //     }
// //     //     catch(err){

// //     //         alert(err.message);

// //     //     }
// //     //     finally{

// //     //         setLoading(false);

// //     //     }


// //     // };

// //     const submitCSV = async () => {


// //         if (!csvData.courseId || !csvData.sessionId) {

// //             alert("Select course and session first");
// //             return;

// //         }


// //         if (csvRows.length === 0) {

// //             alert("Upload CSV first");
// //             return;

// //         }



// //         try {

// //             setLoading(true);


// //             const rows = csvRows.map(row => ({

// //                 courseId: csvData.courseId,

// //                 sessionId: csvData.sessionId,

// //                 date: row.date,

// //                 startTime: row.startTime,

// //                 endTime: row.endTime,

// //                 trainerId: row.trainerId,

// //                 roomNo: row.roomNo,

// //                 topic: row.topic

// //             }));


// //             await appendSlotsViaCSV(
// //                 rows,
// //                 token
// //             );



// //             alert("Slots added successfully");

// //             onBack();


// //         }
// //         catch (err) {

// //             alert(err.message);

// //         }
// //         finally {

// //             setLoading(false);

// //         }

// //     };




// //     return (

// //         <div className="new-schedule-page">


// //             <button onClick={onBack}>
// //                 ← Back
// //             </button>


// //             <h2>
// //                 Create Schedule
// //             </h2>




// //             <div>

// //                 <button
// //                     onClick={() => setMode("manual")}
// //                 >
// //                     Manual
// //                 </button>


// //                 <button
// //                     onClick={() => setMode("csv")}
// //                 >
// //                     Upload CSV
// //                 </button>

// //             </div>





// //             {
// //                 mode === "manual" &&

// //                 <div className="schedule-form">


// //                     <div className="form-group">

// //                         <label>
// //                             Course
// //                         </label>


// //                         <select
// //                             value={formData.courseId}
// //                             onChange={(e) =>
// //                                 handleChange(
// //                                     "courseId",
// //                                     e.target.value
// //                                 )
// //                             }>

// //                             <option value="">
// //                                 Select Course
// //                             </option>


// //                             {
// //                                 AllCourses.map(course => (

// //                                     <option
// //                                         key={course._id}
// //                                         value={course._id}
// //                                     >

// //                                         {course.courseCode}

// //                                     </option>

// //                                 ))

// //                             }


// //                         </select>

// //                     </div>





// //                     <div className="form-group">

// //                         <label>
// //                             Session
// //                         </label>


// //                         <select

// //                             value={formData.sessionId}

// //                             onChange={(e) =>
// //                                 handleChange(
// //                                     "sessionId",
// //                                     e.target.value
// //                                 )
// //                             }>


// //                             <option value="">
// //                                 Select Session
// //                             </option>


// //                             {
// //                                 AllSessions.map(session => (

// //                                     <option
// //                                         key={session._id}
// //                                         value={session._id}
// //                                     >

// //                                         {session.collegeId?.name}
// //                                         -
// //                                         {
// //                                             new Date(
// //                                                 session.startDate
// //                                             ).toLocaleDateString()
// //                                         }

// //                                     </option>


// //                                 ))

// //                             }


// //                         </select>

// //                     </div>






// //                     <h3>
// //                         Add Slot
// //                     </h3>




// //                     <input
// //                         type="date"
// //                         value={slot.date}
// //                         onChange={(e) =>
// //                             setSlot({
// //                                 ...slot,
// //                                 date: e.target.value
// //                             })
// //                         }
// //                     />



// //                     <input
// //                         type="time"
// //                         value={slot.startTime}
// //                         onChange={(e) =>
// //                             setSlot({
// //                                 ...slot,
// //                                 startTime: e.target.value
// //                             })
// //                         }
// //                     />



// //                     <input
// //                         type="time"
// //                         value={slot.endTime}
// //                         onChange={(e) =>
// //                             setSlot({
// //                                 ...slot,
// //                                 endTime: e.target.value
// //                             })
// //                         }
// //                     />





// //                     <select

// //                         value={slot.trainerId}

// //                         onChange={(e) =>
// //                             setSlot({
// //                                 ...slot,
// //                                 trainerId: e.target.value
// //                             })
// //                         }

// //                     >

// //                         <option value="">
// //                             Select Trainer
// //                         </option>


// //                         {
// //                             AllTrainers.map(trainer => (

// //                                 <option
// //                                     key={trainer._id}
// //                                     value={trainer._id}
// //                                 >

// //                                     {trainer.name}

// //                                 </option>

// //                             ))

// //                         }


// //                     </select>





// //                     <input
// //                         placeholder="Room No"
// //                         value={slot.roomNo}
// //                         onChange={(e) =>
// //                             setSlot({
// //                                 ...slot,
// //                                 roomNo: e.target.value
// //                             })
// //                         }
// //                     />





// //                     <input
// //                         placeholder="Topic"
// //                         value={slot.topic}
// //                         onChange={(e) =>
// //                             setSlot({
// //                                 ...slot,
// //                                 topic: e.target.value
// //                             })
// //                         }
// //                     />




// //                     <button onClick={addSlot}>
// //                         Add Slot
// //                     </button>



// //                     <button
// //                         className="save-btn"
// //                         disabled={loading}
// //                         onClick={submitManual}
// //                     >

// //                         {
// //                             loading
// //                                 ?
// //                                 "Creating..."
// //                                 :
// //                                 "Create Schedule"
// //                         }

// //                     </button>


// //                 </div>

// //             }





// //             {/* {
// //             mode==="csv" &&

// //             <div className="schedule-form">


// //                 <h3>
// //                     Upload Schedule CSV
// //                 </h3>



// //                 <input
// //                 type="file"
// //                 accept=".csv"
// //                 onChange={(e)=>
// //                     handleCSV(
// //                         e.target.files[0]
// //                     )
// //                 }
// //                 />




// //                 {
// //                 csvRows.length>0 &&

// //                 <div>

// //                     <h4>
// //                         Preview
// //                     </h4>


// //                     <pre>
// //                         {
// //                         JSON.stringify(
// //                             csvRows,
// //                             null,
// //                             2
// //                         )
// //                         }
// //                     </pre>


// //                 </div>

// //                 }





// //                 <button

// //                 className="save-btn"

// //                 disabled={loading}

// //                 onClick={submitCSV}

// //                 >

// //                     {
// //                     loading
// //                     ?
// //                     "Uploading..."
// //                     :
// //                     "Append Slots"
// //                     }


// //                 </button>


// //             </div>

// //             } */}

// //             {
// //                 mode === "csv" &&

// //                 <div className="schedule-form">


// //                     <h3>
// //                         Upload Schedule CSV
// //                     </h3>



// //                     <div className="form-group">

// //                         <label>
// //                             Course
// //                         </label>


// //                         <select

// //                             value={csvData.courseId}

// //                             onChange={(e) =>
// //                                 setCsvData({

// //                                     ...csvData,

// //                                     courseId: e.target.value

// //                                 })
// //                             }

// //                         >

// //                             <option value="">
// //                                 Select Course
// //                             </option>


// //                             {
// //                                 AllCourses.map(course => (

// //                                     <option
// //                                         key={course._id}
// //                                         value={course._id}
// //                                     >

// //                                         {course.courseCode}

// //                                     </option>

// //                                 ))

// //                             }


// //                         </select>

// //                     </div>





// //                     <div className="form-group">

// //                         <label>
// //                             Session
// //                         </label>


// //                         <select

// //                             value={csvData.sessionId}

// //                             onChange={(e) =>
// //                                 setCsvData({

// //                                     ...csvData,

// //                                     sessionId: e.target.value

// //                                 })
// //                             }

// //                         >

// //                             <option value="">
// //                                 Select Session
// //                             </option>


// //                             {
// //                                 AllSessions.map(session => (

// //                                     <option

// //                                         key={session._id}

// //                                         value={session._id}

// //                                     >

// //                                         {
// //                                             session.collegeId?.name
// //                                         }

// //                                         -

// //                                         {
// //                                             new Date(
// //                                                 session.startDate
// //                                             )
// //                                                 .toLocaleDateString()
// //                                         }


// //                                     </option>

// //                                 ))

// //                             }


// //                         </select>

// //                     </div>





// //                     <input

// //                         type="file"

// //                         accept=".csv"

// //                         onChange={(e) =>
// //                             handleCSV(
// //                                 e.target.files[0]
// //                             )
// //                         }

// //                     />




// //                     {
// //                         csvRows.length > 0 &&

// //                         <div>

// //                             <h4>
// //                                 Preview
// //                             </h4>


// //                             <pre>

// //                                 {
// //                                     JSON.stringify(
// //                                         csvRows,
// //                                         null,
// //                                         2
// //                                     )
// //                                 }

// //                             </pre>


// //                         </div>

// //                     }





// //                     <button

// //                         className="save-btn"

// //                         disabled={loading}

// //                         onClick={submitCSV}

// //                     >

// //                         {
// //                             loading
// //                                 ?
// //                                 "Uploading..."
// //                                 :
// //                                 "Append Slots"

// //                         }

// //                     </button>


// //                 </div>

// //             }



// //         </div>

// //     );

// // }



















// // // import "./NewSchedulePage.css";
// // // import { useDashboard } from "../../../../hooks/useDashboard";
// // // import { useState } from "react";


// // // export default function NewSchedulePage({
// // //     token,
// // //     onBack,
// // //     AllCourses = [],
// // //     AllSessions = [],
// // //     AllTrainers = []
// // // }) {


// // //     const {
// // //         createSchedule
// // //     } = useDashboard();



// // //     const [formData, setFormData] = useState({

// // //         courseId: "",
// // //         sessionId: "",
// // //         slots: {}

// // //     });



// // //     const [slot, setSlot] = useState({

// // //         date: "",
// // //         startTime: "",
// // //         endTime: "",
// // //         trainerId: "",
// // //         roomNo: "",
// // //         topic: ""

// // //     });


// // //     const [loading, setLoading] = useState(false);




// // //     const handleChange = (field, value) => {

// // //         setFormData(prev => ({
// // //             ...prev,
// // //             [field]: value
// // //         }));

// // //     };



// // //     const addSlot = () => {

// // //         if (
// // //             !slot.date ||
// // //             !slot.startTime ||
// // //             !slot.endTime ||
// // //             !slot.trainerId ||
// // //             !slot.roomNo
// // //         ) {
// // //             alert("Fill all slot details");
// // //             return;
// // //         }



// // //         setFormData(prev => ({

// // //             ...prev,

// // //             slots: {

// // //                 ...prev.slots,

// // //                 [slot.date]:

// // //                     [
// // //                         ...(prev.slots[slot.date] || []),

// // //                         {
// // //                             startTime: slot.startTime,
// // //                             endTime: slot.endTime,
// // //                             trainerId: slot.trainerId,
// // //                             roomNo: slot.roomNo,
// // //                             topic: slot.topic
// // //                         }

// // //                     ]

// // //             }

// // //         }));



// // //         setSlot({

// // //             date: "",
// // //             startTime: "",
// // //             endTime: "",
// // //             trainerId: "",
// // //             roomNo: "",
// // //             topic: ""

// // //         });


// // //     };





// // //     const handleSubmit = async () => {


// // //         try {


// // //             setLoading(true);


// // //             await createSchedule(
// // //                 formData,
// // //                 token
// // //             );


// // //             alert("Schedule created");


// // //             onBack();


// // //         }
// // //         catch (err) {

// // //             alert(err.message);

// // //         }
// // //         finally {

// // //             setLoading(false);

// // //         }


// // //     };





// // //     return (

// // //         <div className="new-schedule-page">


// // //             <button onClick={onBack}>
// // //                 ← Back
// // //             </button>


// // //             <h2>
// // //                 Create Schedule
// // //             </h2>



// // //             <div className="schedule-form">


// // //                 <div className="form-group">

// // //                     <label>
// // //                         Course
// // //                     </label>


// // //                     <select

// // //                         value={formData.courseId}

// // //                         onChange={(e) =>
// // //                             handleChange(
// // //                                 "courseId",
// // //                                 e.target.value
// // //                             )
// // //                         }

// // //                     >

// // //                         <option value="">
// // //                             Select Course
// // //                         </option>


// // //                         {
// // //                             AllCourses.map(course => (

// // //                                 <option
// // //                                     key={course._id}
// // //                                     value={course._id}
// // //                                 >

// // //                                     {course.courseCode}

// // //                                 </option>

// // //                             ))

// // //                         }


// // //                     </select>


// // //                 </div>




// // //                 <div className="form-group">

// // //                     <label>
// // //                         Session
// // //                     </label>


// // //                     <select

// // //                         value={formData.sessionId}

// // //                         onChange={(e) =>
// // //                             handleChange(
// // //                                 "sessionId",
// // //                                 e.target.value
// // //                             )
// // //                         }

// // //                     >


// // //                         <option value="">
// // //                             Select Session
// // //                         </option>



// // //                         {
// // //                             AllSessions.map(session => (

// // //                                 <option
// // //                                     key={session._id}
// // //                                     value={session._id}
// // //                                 >

// // //                                     {
// // //                                         session.collegeId?.name
// // //                                     }
// // //                                     -
// // //                                     {
// // //                                         new Date(
// // //                                             session.startDate
// // //                                         ).toLocaleDateString()
// // //                                     }

// // //                                 </option>

// // //                             ))

// // //                         }


// // //                     </select>


// // //                 </div>





// // //                 <h3>
// // //                     Add Slot
// // //                 </h3>




// // //                 <input
// // //                     type="date"
// // //                     value={slot.date}
// // //                     onChange={(e) =>
// // //                         setSlot({
// // //                             ...slot,
// // //                             date: e.target.value
// // //                         })
// // //                     }
// // //                 />



// // //                 <input
// // //                     type="time"
// // //                     value={slot.startTime}
// // //                     onChange={(e) =>
// // //                         setSlot({
// // //                             ...slot,
// // //                             startTime: e.target.value
// // //                         })
// // //                     }
// // //                 />



// // //                 <input
// // //                     type="time"
// // //                     value={slot.endTime}
// // //                     onChange={(e) =>
// // //                         setSlot({
// // //                             ...slot,
// // //                             endTime: e.target.value
// // //                         })
// // //                     }
// // //                 />





// // //                 <select

// // //                     value={slot.trainerId}

// // //                     onChange={(e) =>
// // //                         setSlot({
// // //                             ...slot,
// // //                             trainerId: e.target.value
// // //                         })
// // //                     }

// // //                 >


// // //                     <option>
// // //                         Select Trainer
// // //                     </option>


// // //                     {
// // //                         AllTrainers.map(trainer => (

// // //                             <option
// // //                                 key={trainer._id}
// // //                                 value={trainer._id}
// // //                             >

// // //                                 {trainer.name}

// // //                             </option>

// // //                         ))

// // //                     }


// // //                 </select>





// // //                 <input

// // //                     placeholder="Room No"

// // //                     value={slot.roomNo}

// // //                     onChange={(e) =>
// // //                         setSlot({
// // //                             ...slot,
// // //                             roomNo: e.target.value
// // //                         })
// // //                     }

// // //                 />





// // //                 <input

// // //                     placeholder="Topic"

// // //                     value={slot.topic}

// // //                     onChange={(e) =>
// // //                         setSlot({
// // //                             ...slot,
// // //                             topic: e.target.value
// // //                         })
// // //                     }

// // //                 />



// // //                 <button
// // //                     type="button"
// // //                     onClick={addSlot}
// // //                 >
// // //                     Add Slot
// // //                 </button>




// // //                 <button

// // //                     className="save-btn"

// // //                     disabled={loading}

// // //                     onClick={handleSubmit}

// // //                 >

// // //                     {
// // //                         loading
// // //                             ?
// // //                             "Creating..."
// // //                             :
// // //                             "Create Schedule"
// // //                     }


// // //                 </button>



// // //             </div>



// // //         </div>

// // //     );

// // // }