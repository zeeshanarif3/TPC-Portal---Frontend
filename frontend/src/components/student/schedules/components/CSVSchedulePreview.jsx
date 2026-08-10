import { useState, useMemo } from "react";
import "./CSVSchedulePreview.css";


export default function CSVSchedulePreview({

    schedules = [],

    AllCourses = [],
    AllTrainers = [],

    createSchedule,
    token,

    onBack

}) {


    const ENABLE_IMPORT = true;


    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // calendar navigation state
    const [viewDate, setViewDate] = useState(() => {

        // default to month of the first schedule row, else today
        if (schedules.length > 0 && schedules[0].date) {

            const d = new Date(schedules[0].date);
            if (!isNaN(d)) return new Date(d.getFullYear(), d.getMonth(), 1);

        }

        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);

    });

    const [selectedDate, setSelectedDate] = useState(null);


    function getCourseName(id) {

        return AllCourses.find(c => c._id === id)?.courseCode || "Unknown";

    }


    function getTrainerName(id) {

        return AllTrainers.find(t => t._id === id)?.name || "Unknown";

    }


    // ---- date helpers ----

    // normalize any incoming date (Date obj or string) to a "YYYY-MM-DD" key
    function toDateKey(dateInput) {

        if (!dateInput) return null;

        const d = new Date(dateInput);
        if (isNaN(d)) return null;

        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${y}-${m}-${day}`;

    }


    // group all schedules by their real date, once
    const schedulesByDate = useMemo(() => {

        const map = new Map();

        schedules.forEach(schedule => {

            const key = toDateKey(schedule.date);
            if (!key) return;

            if (!map.has(key)) map.set(key, []);
            map.get(key).push(schedule);

        });

        // keep each day's slots sorted by start time
        map.forEach(list => {

            list.sort((a, b) =>
                (a.startTime || "").localeCompare(b.startTime || "")
            );

        });

        return map;

    }, [schedules]);


    // months that actually contain data — lets you jump straight to
    // relevant months instead of clicking next/prev through a whole year
    const monthsWithData = useMemo(() => {

        const set = new Set();

        schedules.forEach(schedule => {

            const key = toDateKey(schedule.date);
            if (!key) return;

            set.add(key.slice(0, 7)); // "YYYY-MM"

        });

        return [...set].sort();

    }, [schedules]);


    function formatTime12h(time) {

        if (!time) return "";

        const [hStr, mStr] = time.split(":");
        let h = parseInt(hStr, 10);
        const suffix = h >= 12 ? "PM" : "AM";

        h = h % 12;
        if (h === 0) h = 12;

        return `${h}:${mStr} ${suffix}`;

    }


    // build the 6x7 grid of dates for the visible month, including
    // leading/trailing days from adjacent months so weeks stay aligned
    const calendarCells = useMemo(() => {

        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstOfMonth = new Date(year, month, 1);
        const startOffset = firstOfMonth.getDay(); // 0=Sun

        const gridStart = new Date(year, month, 1 - startOffset);

        const cells = [];

        for (let i = 0; i < 42; i++) {

            const cellDate = new Date(gridStart);
            cellDate.setDate(gridStart.getDate() + i);

            const key = toDateKey(cellDate);

            cells.push({
                date: cellDate,
                key,
                inCurrentMonth: cellDate.getMonth() === month,
                schedules: schedulesByDate.get(key) || []
            });

        }

        return cells;

    }, [viewDate, schedulesByDate]);


    const monthLabel = viewDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });


    function goPrevMonth() {

        setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
        setSelectedDate(null);

    }


    function goNextMonth() {

        setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
        setSelectedDate(null);

    }


    function jumpToMonth(monthKey) {

        // monthKey is "YYYY-MM"
        const [y, m] = monthKey.split("-").map(Number);
        setViewDate(new Date(y, m - 1, 1));
        setSelectedDate(null);

    }


    const selectedDaySchedules = selectedDate
        ? (schedulesByDate.get(selectedDate) || [])
        : [];


    async function importSchedules() {

        if (!ENABLE_IMPORT) {

            setMessage("Import disabled");
            return;

        }

        setLoading(true);

        let successCount = 0;
        const failures = [];

        for (let i = 0; i < schedules.length; i++) {

            const schedule = schedules[i];

            try {

                await createSchedule(schedule, token);
                successCount++;

            }
            catch (err) {

                failures.push(
                    `Row ${i + 1} (${schedule.roomNo}, ${schedule.date}): ${err.message}`
                );

            }

        }

        setLoading(false);

        if (failures.length === 0) {

            setMessage(`All ${successCount} schedules imported successfully`);

        } else {

            setMessage(
                `${successCount} imported, ${failures.length} failed — ${failures.join("; ")}`
            );

        }

    }


    return (

        <div className="csv-calendar-container">

            <button className="back-btn" onClick={onBack}>
                ← Back
            </button>

            <div className="csv-header">

                <h2>CSV Schedule Preview</h2>

                <button
                    className={ENABLE_IMPORT ? "import-btn active" : "import-btn"}
                    onClick={importSchedules}
                >
                    {loading ? "Importing..." : "Import Schedules"}
                </button>

            </div>

            {
                message &&
                <div className="message">
                    {message}
                </div>
            }

            {/* month navigation */}
            <div className="calendar-nav">

                <button className="nav-btn" onClick={goPrevMonth}>‹ Prev</button>

                <div className="nav-month-label">{monthLabel}</div>

                <button className="nav-btn" onClick={goNextMonth}>Next ›</button>

                {
                    monthsWithData.length > 1 &&

                    <select
                        className="month-jump"
                        value={`${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`}
                        onChange={e => jumpToMonth(e.target.value)}
                    >

                        {
                            monthsWithData.map(mk => (

                                <option key={mk} value={mk}>

                                    {
                                        new Date(mk + "-01").toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric"
                                        })
                                    }

                                </option>

                            ))
                        }

                    </select>

                }

            </div>

            {/* month grid */}
            <div className="month-grid">

                <div className="month-grid-header">

                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (

                        <div key={d} className="weekday-label">{d}</div>

                    ))}

                </div>

                <div className="month-grid-body">

                    {
                        calendarCells.map(cell => (

                            <div
                                key={cell.key}
                                className={
                                    "month-cell" +
                                    (cell.inCurrentMonth ? "" : " outside-month") +
                                    (cell.schedules.length > 0 ? " has-data" : "") +
                                    (selectedDate === cell.key ? " selected" : "")
                                }
                                onClick={() =>
                                    cell.schedules.length > 0 &&
                                    setSelectedDate(
                                        selectedDate === cell.key ? null : cell.key
                                    )
                                }
                            >

                                <div className="cell-date-num">
                                    {cell.date.getDate()}
                                </div>

                                {
                                    cell.schedules.length > 0 &&

                                    <div className="cell-badge">
                                        {cell.schedules.length} session{cell.schedules.length > 1 ? "s" : ""}
                                    </div>

                                }

                                {
                                    cell.schedules.slice(0, 2).map((s, i) => (

                                        <div key={i} className="cell-chip">
                                            {getCourseName(s.courseId) !== "Unknown"
                                                ? getCourseName(s.courseId)
                                                : (s.courseCode || s.topic || "Session")}
                                        </div>

                                    ))
                                }

                                {
                                    cell.schedules.length > 2 &&

                                    <div className="cell-more">
                                        +{cell.schedules.length - 2} more
                                    </div>

                                }

                            </div>

                        ))
                    }

                </div>

            </div>

            {/* selected day detail */}
            {
                selectedDate &&

                <div className="day-detail">

                    <h3>

                        {
                            new Date(selectedDate).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric"
                            })
                        }

                    </h3>

                    <div className="day-detail-list">

                        {
                            selectedDaySchedules.map((slot, index) => (

                                <div key={index} className="schedule-card">

                                    <div className="card-title">
                                        {getCourseName(slot.courseId)}
                                    </div>

                                    <div className="card-time">
                                        {formatTime12h(slot.startTime)} - {formatTime12h(slot.endTime)}
                                    </div>

                                    <div>
                                        Trainer: {getTrainerName(slot.trainerId)}
                                    </div>

                                    <div>
                                        Room: {slot.roomNo}
                                    </div>

                                    {
                                        slot.topic &&

                                        <div className="topic">
                                            {slot.topic}
                                        </div>

                                    }

                                </div>

                            ))
                        }

                    </div>

                </div>
            }

        </div>

    );

}














// import { useState } from "react";
// import "./CSVSchedulePreview.css";


// export default function CSVSchedulePreview({

//     schedules = [],

//     AllCourses = [],
//     AllTrainers = [],

//     createSchedule,
//     token,

//     onBack

// }) {


//     const ENABLE_IMPORT = true;


//     const [loading, setLoading] = useState(false);

//     const [message, setMessage] = useState("");

//     const [hoveredSlot, setHoveredSlot] = useState(null);



//     const weekDays = [
//         "Monday",
//         "Tuesday",
//         "Wednesday",
//         "Thursday",
//         "Friday",
//         "Saturday"
//     ];





//     function getCourseName(id) {

//         return (
//             AllCourses.find(
//                 c => c._id === id
//             )
//                 ?.courseCode
//             ||
//             "Unknown"
//         );

//     }






//     function getTrainerName(id) {

//         return (
//             AllTrainers.find(
//                 t => t._id === id
//             )
//                 ?.name
//             ||
//             "Unknown"
//         );

//     }







//     const convertHour = (time) => {

//         if (!time)
//             return null;



//         let hour =
//             parseInt(
//                 time.split(":")[0],
//                 10
//             );



//         if (
//             time.includes("PM") &&
//             hour !== 12
//         ) {

//             hour += 12;

//         }



//         if (
//             time.includes("AM") &&
//             hour === 12
//         ) {

//             hour = 0;

//         }



//         return hour;

//     };






//     const formatHour = (hour) => {

//         const date = new Date();


//         date.setHours(
//             hour,
//             0,
//             0,
//             0
//         );


//         return date.toLocaleTimeString(
//             "en-US",
//             {
//                 hour: "numeric",
//                 minute: "2-digit"
//             }
//         );

//     };









//     function getWeekDayFromDate(date) {


//         if (!date)
//             return null;



//         return new Date(date)
//             .toLocaleDateString(
//                 "en-US",
//                 {
//                     weekday: "long"
//                 }
//             );


//     }









//     function generateTimeSlots() {


//         const hours = new Set();



//         // default college timing
//         for (
//             let i = 8;
//             i <= 17;
//             i++
//         ) {

//             hours.add(i);

//         }




//         schedules.forEach(schedule => {


//             const start =
//                 convertHour(
//                     schedule.startTime
//                 );



//             const end =
//                 convertHour(
//                     schedule.endTime
//                 );



//             if (start !== null)
//                 hours.add(start);



//             if (end !== null)
//                 hours.add(end);



//         });




//         return [

//             ...hours

//         ]
//             .sort(
//                 (a, b) => a - b
//             );


//     }







//     const timeSlots =
//         generateTimeSlots();








//     function getSchedulesForSlot(day, hour) {


//         return schedules.filter(
//             schedule => {


//                 const scheduleDay =
//                     getWeekDayFromDate(
//                         schedule.date
//                     );



//                 return (

//                     scheduleDay === day

//                     &&

//                     convertHour(
//                         schedule.startTime
//                     )
//                     ===
//                     hour

//                 );


//             }
//         );


//     }









//     // async function importSchedules() {


//     //     if (!ENABLE_IMPORT) {

//     //         setMessage(
//     //             "Import disabled"
//     //         );

//     //         return;

//     //     }




//     //     try {


//     //         setLoading(true);



//     //         for (
//     //             const schedule of schedules
//     //         ) {

//     //             await createSchedule(
//     //                 schedule,
//     //                 token
//     //             );

//     //         }



//     //         setMessage(
//     //             "Schedules imported successfully"
//     //         );


//     //     }
//     //     catch (err) {

//     //         setMessage(
//     //             err.message
//     //         );

//     //     }
//     //     finally {

//     //         setLoading(false);

//     //     }


//     // }




// async function importSchedules() {


//         if (!ENABLE_IMPORT) {

//             setMessage(
//                 "Import disabled"
//             );

//             return;

//         }




//         setLoading(true);

//         let successCount = 0;
//         const failures = [];



//         for (
//             let i = 0;
//             i < schedules.length;
//             i++
//         ) {

//             const schedule = schedules[i];

//             try {

//                 await createSchedule(
//                     schedule,
//                     token
//                 );

//                 successCount++;

//             }
//             catch (err) {

//                 failures.push(
//                     `Row ${i+1} (${schedule.roomNo}, ${schedule.date}): ${err.message}`
//                 );

//             }

//         }



//         setLoading(false);



//         if (failures.length === 0) {

//             setMessage(
//                 `All ${successCount} schedules imported successfully`
//             );

//         } else {

//             setMessage(
//                 `${successCount} imported, ${failures.length} failed — ${failures.join("; ")}`
//             );

//         }


//     }



//     return (

//         <div className="csv-calendar-container">



//             <button

//                 className="back-btn"

//                 onClick={onBack}

//             >

//                 ← Back

//             </button>





//             <div className="csv-header">


//                 <h2>
//                     CSV Schedule Preview
//                 </h2>




//                 <button

//                     className={
//                         ENABLE_IMPORT
//                             ?
//                             "import-btn active"
//                             :
//                             "import-btn"
//                     }

//                     onClick={importSchedules}

//                 >

//                     {
//                         loading
//                             ?
//                             "Importing..."
//                             :
//                             "Import Schedules"
//                     }


//                 </button>


//             </div>






//             {
//                 message &&

//                 <div className="message">

//                     {message}

//                 </div>

//             }







//             <div className="calendar-main">


//                 <div className="calendar-grid">



//                     <div className="grid-header">


//                         <div className="time-label">
//                             TIME
//                         </div>




//                         {
//                             weekDays.map(day => (

//                                 <div

//                                     key={day}

//                                     className="day-header"

//                                 >

//                                     {day}

//                                 </div>


//                             ))

//                         }



//                     </div>







//                     {
//                         timeSlots.map(hour => (


//                             <div

//                                 className="time-row"

//                                 key={hour}

//                             >



//                                 <div className="time-label">

//                                     {formatHour(hour)}

//                                 </div>








//                                 {
//                                     weekDays.map(day => (


//                                         <div

//                                             key={`${day}-${hour}`}

//                                             className="time-slot"



//                                             onMouseEnter={() =>
//                                                 setHoveredSlot(
//                                                     `${day}-${hour}`
//                                                 )
//                                             }


//                                             onMouseLeave={() =>
//                                                 setHoveredSlot(null)
//                                             }


//                                         >



//                                             {
//                                                 getSchedulesForSlot(
//                                                     day,
//                                                     hour
//                                                 )
//                                                     .map((slot, index) => (


//                                                         <div

//                                                             key={index}

//                                                             className="schedule-card"

//                                                         >




//                                                             <div className="card-title">

//                                                                 {
//                                                                     getCourseName(
//                                                                         slot.courseId
//                                                                     )
//                                                                 }

//                                                             </div>





//                                                             <div className="card-time">

//                                                                 {slot.startTime}

//                                                                 -

//                                                                 {slot.endTime}

//                                                             </div>





//                                                             <div>

//                                                                 Trainer:

//                                                                 {
//                                                                     getTrainerName(
//                                                                         slot.trainerId
//                                                                     )
//                                                                 }

//                                                             </div>





//                                                             <div>

//                                                                 Room:

//                                                                 {slot.roomNo}

//                                                             </div>





//                                                             {
//                                                                 slot.topic &&

//                                                                 <div className="topic">

//                                                                     {slot.topic}

//                                                                 </div>

//                                                             }




//                                                         </div>


//                                                     ))


//                                             }



//                                         </div>


//                                     ))


//                                 }



//                             </div>


//                         ))

//                     }



//                 </div>


//             </div>


//         </div>

//     );

// }










// // import { useState } from "react";
// // // import "./CSVSchedulePreview.css";


// // export default function CSVSchedulePreview({

// //     schedules = [],

// //     AllCourses = [],
// //     AllTrainers = [],

// //     createSchedule,
// //     token,

// //     onBack

// // }) {


// //     // const ENABLE_IMPORT = false;
// //     const ENABLE_IMPORT = true;



// //     const [loading,setLoading] = useState(false);

// //     const [message,setMessage] = useState("");

// //     const [hoveredSlot,setHoveredSlot] = useState(null);




// //     const weekDays = [
// //         "Monday",
// //         "Tuesday",
// //         "Wednesday",
// //         "Thursday",
// //         "Friday",
// //         "Saturday"
// //     ];





// //     function getCourseName(id){

// //         return (
// //             AllCourses.find(
// //                 c=>c._id===id
// //             )
// //             ?.courseCode
// //             ||
// //             "Unknown"
// //         );

// //     }




// //     function getTrainerName(id){

// //         return (
// //             AllTrainers.find(
// //                 t=>t._id===id
// //             )
// //             ?.name
// //             ||
// //             "Unknown"
// //         );

// //     }





// //     const convertHour=(time)=>{

// //         if(!time)
// //             return null;


// //         return parseInt(
// //             time.split(":")[0]
// //         );

// //     };





// //     const formatHour=(hour)=>{


// //         const date=new Date();

// //         date.setHours(
// //             hour,
// //             0
// //         );


// //         return date.toLocaleTimeString(
// //             "en-US",
// //             {
// //                 hour:"numeric",
// //                 minute:"2-digit"
// //             }
// //         );


// //     };






// //     function generateTimeSlots(){


// //         const hours=new Set();


// //         for(let i=8;i<=17;i++){

// //             hours.add(i);

// //         }



// //         schedules.forEach(schedule=>{


// //             Object.values(
// //                 schedule.slots || {}
// //             )
// //             .flat()
// //             .forEach(slot=>{


// //                 const start=
// //                 convertHour(
// //                     slot.startTime
// //                 );


// //                 const end=
// //                 convertHour(
// //                     slot.endTime
// //                 );


// //                 if(start!==null)
// //                     hours.add(start);


// //                 if(end!==null)
// //                     hours.add(end);


// //             });


// //         });



// //         return [...hours]
// //         .sort(
// //             (a,b)=>a-b
// //         );


// //     }




// //     const timeSlots =
// //     generateTimeSlots();







// //     function getSchedulesForSlot(day,hour){


// //         const dayKey =
// //         day.toLowerCase();



// //         return schedules.flatMap(
// //             schedule=>{


// //                 return (
// //                     schedule.slots?.[dayKey]
// //                     ||
// //                     []
// //                 )
// //                 .filter(slot=>

// //                     convertHour(
// //                         slot.startTime
// //                     )
// //                     ===
// //                     hour

// //                 )
// //                 .map(slot=>({

// //                     ...slot,

// //                     courseId:
// //                     schedule.courseId


// //                 }));



// //             }
// //         );


// //     }








// //     async function importSchedules(){


// //         if(!ENABLE_IMPORT){

// //             setMessage(
// //                 "Import disabled (developer mode)"
// //             );

// //             return;

// //         }



// //         try{


// //             setLoading(true);



// //             for(
// //                 const schedule
// //                 of schedules
// //             ){

// //                 await createSchedule(
// //                     schedule,
// //                     token
// //                 );

// //             }



// //             setMessage(
// //                 "Schedules imported successfully"
// //             );


// //         }
// //         catch(err){

// //             setMessage(
// //                 err.message
// //             );

// //         }
// //         finally{

// //             setLoading(false);

// //         }


// //     }








// // return (

// // <div className="csv-calendar-container">



// // <button
// // className="back-btn"
// // onClick={onBack}
// // >
// // ← Back
// // </button>




// // <div className="csv-header">


// // <h2>
// // CSV Schedule Preview
// // </h2>



// // <button

// // className={
// // ENABLE_IMPORT
// // ?
// // "import-btn active"
// // :
// // "import-btn"
// // }

// // onClick={importSchedules}

// // >

// // {
// // loading
// // ?
// // "Importing..."
// // :
// // "Import Schedules"
// // }


// // </button>


// // </div>





// // {
// // message &&

// // <div className="message">
// // {message}
// // </div>

// // }






// // <div className="calendar-main">



// // <div className="calendar-grid">



// // <div className="grid-header">


// // <div className="time-label">
// // TIME
// // </div>



// // {
// // weekDays.map(day=>(

// // <div
// // key={day}
// // className="day-header"
// // >

// // {day}

// // </div>

// // ))
// // }



// // </div>







// // {
// // timeSlots.map(hour=>(


// // <div
// // className="time-row"
// // key={hour}
// // >


// // <div className="time-label">

// // {formatHour(hour)}

// // </div>




// // {
// // weekDays.map(day=>(


// // <div

// // key={
// // `${day}-${hour}`
// // }

// // className="time-slot"


// // onMouseEnter={()=>
// // setHoveredSlot(
// // `${day}-${hour}`
// // )
// // }

// // onMouseLeave={()=>
// // setHoveredSlot(null)
// // }


// // >


// // {
// // getSchedulesForSlot(
// // day,
// // hour
// // )
// // .map((slot,index)=>(



// // <div

// // key={index}

// // className="schedule-card"

// // >


// // <div className="card-title">

// // {
// // getCourseName(
// // slot.courseId
// // )
// // }

// // </div>




// // <div className="card-time">

// // {slot.startTime}
// // -
// // {slot.endTime}

// // </div>




// // <div>

// // Trainer:

// // {
// // getTrainerName(
// // slot.trainerId
// // )
// // }

// // </div>




// // <div>

// // Room:

// // {slot.roomNo}

// // </div>




// // {
// // slot.topic &&

// // <div className="topic">

// // {slot.topic}

// // </div>

// // }



// // </div>



// // ))

// // }



// // </div>



// // ))

// // }




// // </div>


// // ))

// // }



// // </div>


// // </div>


// // </div>

// // );

// // }


// // // import "./CSVSchedulePreview.css";
// // // import { useState } from "react";


// // // export default function CSVSchedulePreview({

// // //     schedules = [],

// // //     AllCourses = [],
// // //     AllTrainers = [],

// // //     createSchedule,
// // //     token,

// // //     onBack

// // // }) {


// // //     // Developer switch
// // //     const ENABLE_IMPORT = false;



// // //     const days = [
// // //         "monday",
// // //         "tuesday",
// // //         "wednesday",
// // //         "thursday",
// // //         "friday",
// // //         "saturday"
// // //     ];



// // //     const [loading,setLoading] = useState(false);
// // //     const [message,setMessage] = useState("");




// // //     function getCourseName(id){

// // //         return (
// // //             AllCourses.find(
// // //                 c=>c._id===id
// // //             )?.courseCode
// // //             ||
// // //             "Unknown Course"
// // //         );

// // //     }



// // //     function getTrainerName(id){

// // //         return (
// // //             AllTrainers.find(
// // //                 t=>t._id===id
// // //             )?.name
// // //             ||
// // //             "Unknown Trainer"
// // //         );

// // //     }





// // //     function getDaySlots(day){


// // //         let result=[];


// // //         schedules.forEach(schedule=>{


// // //             if(schedule.slots?.[day]){


// // //                 schedule.slots[day]
// // //                 .forEach(slot=>{


// // //                     result.push({

// // //                         ...slot,

// // //                         courseId:
// // //                         schedule.courseId

// // //                     });


// // //                 });


// // //             }


// // //         });


// // //         return result;


// // //     }






// // //     async function importSchedules(){


// // //         if(!ENABLE_IMPORT){

// // //             setMessage(
// // //                 "Import disabled (developer mode)"
// // //             );

// // //             return;

// // //         }



// // //         try{


// // //             setLoading(true);

// // //             setMessage("");



// // //             for(const schedule of schedules){


// // //                 await createSchedule(
// // //                     schedule,
// // //                     token
// // //                 );


// // //             }



// // //             setMessage(
// // //                 `${schedules.length} schedules created successfully`
// // //             );


// // //         }
// // //         catch(err){

// // //             console.error(err);

// // //             setMessage(
// // //                 err.message ||
// // //                 "Import failed"
// // //             );

// // //         }
// // //         finally{

// // //             setLoading(false);

// // //         }


// // //     }






// // //     return (

// // //         <div className="csv-preview-page">


// // //             <button
// // //                 className="back-btn"
// // //                 onClick={onBack}
// // //             >

// // //                 ← Back

// // //             </button>



// // //             <div className="header">


// // //                 <h2>
// // //                     Schedule Preview
// // //                 </h2>


// // //                 <button

// // //                     className={
// // //                         ENABLE_IMPORT
// // //                         ?
// // //                         "import-btn active"
// // //                         :
// // //                         "import-btn"
// // //                     }

// // //                     onClick={importSchedules}

// // //                     disabled={loading}

// // //                 >

// // //                     {
// // //                         loading
// // //                         ?
// // //                         "Importing..."
// // //                         :
// // //                         "Import Schedules"
// // //                     }

// // //                 </button>


// // //             </div>



// // //             {
// // //                 message &&

// // //                 <div className="message">

// // //                     {message}

// // //                 </div>

// // //             }





// // //             <div className="calendar">


// // //                 {
// // //                     days.map(day=>(


// // //                         <div
// // //                             className="day-column"
// // //                             key={day}
// // //                         >


// // //                             <div className="day-header">

// // //                                 {
// // //                                     day.toUpperCase()
// // //                                 }

// // //                             </div>





// // //                             <div className="day-content">


// // //                             {
// // //                                 getDaySlots(day)
// // //                                 .length===0

// // //                                 ?

// // //                                 <div className="empty">

// // //                                     No Classes

// // //                                 </div>


// // //                                 :

// // //                                 getDaySlots(day)
// // //                                 .map((slot,index)=>(


// // //                                     <div

// // //                                         className="schedule-card"

// // //                                         key={index}

// // //                                     >


// // //                                         <div className="course">

// // //                                             {
// // //                                                 getCourseName(
// // //                                                     slot.courseId
// // //                                                 )
// // //                                             }

// // //                                         </div>



// // //                                         <div className="time">

// // //                                             {slot.startTime}
// // //                                             {" - "}
// // //                                             {slot.endTime}

// // //                                         </div>




// // //                                         <div>

// // //                                             Trainer:

// // //                                             {
// // //                                                 getTrainerName(
// // //                                                     slot.trainerId
// // //                                                 )
// // //                                             }

// // //                                         </div>



// // //                                         <div>

// // //                                             Room:
// // //                                             {" "}
// // //                                             {slot.roomNo}

// // //                                         </div>




// // //                                         {
// // //                                             slot.topic &&

// // //                                             <div className="topic">

// // //                                                 {slot.topic}

// // //                                             </div>

// // //                                         }


// // //                                     </div>


// // //                                 ))

// // //                             }



// // //                             </div>


// // //                         </div>


// // //                     ))
// // //                 }


// // //             </div>


// // //         </div>


// // //     );


// // // }