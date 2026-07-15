import { useState } from "react";
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

    const [hoveredSlot, setHoveredSlot] = useState(null);



    const weekDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];





    function getCourseName(id) {

        return (
            AllCourses.find(
                c => c._id === id
            )
                ?.courseCode
            ||
            "Unknown"
        );

    }






    function getTrainerName(id) {

        return (
            AllTrainers.find(
                t => t._id === id
            )
                ?.name
            ||
            "Unknown"
        );

    }







    const convertHour = (time) => {

        if (!time)
            return null;



        let hour =
            parseInt(
                time.split(":")[0],
                10
            );



        if (
            time.includes("PM") &&
            hour !== 12
        ) {

            hour += 12;

        }



        if (
            time.includes("AM") &&
            hour === 12
        ) {

            hour = 0;

        }



        return hour;

    };






    const formatHour = (hour) => {

        const date = new Date();


        date.setHours(
            hour,
            0,
            0,
            0
        );


        return date.toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

    };









    function getWeekDayFromDate(date) {


        if (!date)
            return null;



        return new Date(date)
            .toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            );


    }









    function generateTimeSlots() {


        const hours = new Set();



        // default college timing
        for (
            let i = 8;
            i <= 17;
            i++
        ) {

            hours.add(i);

        }




        schedules.forEach(schedule => {


            const start =
                convertHour(
                    schedule.startTime
                );



            const end =
                convertHour(
                    schedule.endTime
                );



            if (start !== null)
                hours.add(start);



            if (end !== null)
                hours.add(end);



        });




        return [

            ...hours

        ]
            .sort(
                (a, b) => a - b
            );


    }







    const timeSlots =
        generateTimeSlots();








    function getSchedulesForSlot(day, hour) {


        return schedules.filter(
            schedule => {


                const scheduleDay =
                    getWeekDayFromDate(
                        schedule.date
                    );



                return (

                    scheduleDay === day

                    &&

                    convertHour(
                        schedule.startTime
                    )
                    ===
                    hour

                );


            }
        );


    }









    // async function importSchedules() {


    //     if (!ENABLE_IMPORT) {

    //         setMessage(
    //             "Import disabled"
    //         );

    //         return;

    //     }




    //     try {


    //         setLoading(true);



    //         for (
    //             const schedule of schedules
    //         ) {

    //             await createSchedule(
    //                 schedule,
    //                 token
    //             );

    //         }



    //         setMessage(
    //             "Schedules imported successfully"
    //         );


    //     }
    //     catch (err) {

    //         setMessage(
    //             err.message
    //         );

    //     }
    //     finally {

    //         setLoading(false);

    //     }


    // }




async function importSchedules() {


        if (!ENABLE_IMPORT) {

            setMessage(
                "Import disabled"
            );

            return;

        }




        setLoading(true);

        let successCount = 0;
        const failures = [];



        for (
            let i = 0;
            i < schedules.length;
            i++
        ) {

            const schedule = schedules[i];

            try {

                await createSchedule(
                    schedule,
                    token
                );

                successCount++;

            }
            catch (err) {

                failures.push(
                    `Row ${i+1} (${schedule.roomNo}, ${schedule.date}): ${err.message}`
                );

            }

        }



        setLoading(false);



        if (failures.length === 0) {

            setMessage(
                `All ${successCount} schedules imported successfully`
            );

        } else {

            setMessage(
                `${successCount} imported, ${failures.length} failed — ${failures.join("; ")}`
            );

        }


    }



    return (

        <div className="csv-calendar-container">



            <button

                className="back-btn"

                onClick={onBack}

            >

                ← Back

            </button>





            <div className="csv-header">


                <h2>
                    CSV Schedule Preview
                </h2>




                <button

                    className={
                        ENABLE_IMPORT
                            ?
                            "import-btn active"
                            :
                            "import-btn"
                    }

                    onClick={importSchedules}

                >

                    {
                        loading
                            ?
                            "Importing..."
                            :
                            "Import Schedules"
                    }


                </button>


            </div>






            {
                message &&

                <div className="message">

                    {message}

                </div>

            }







            <div className="calendar-main">


                <div className="calendar-grid">



                    <div className="grid-header">


                        <div className="time-label">
                            TIME
                        </div>




                        {
                            weekDays.map(day => (

                                <div

                                    key={day}

                                    className="day-header"

                                >

                                    {day}

                                </div>


                            ))

                        }



                    </div>







                    {
                        timeSlots.map(hour => (


                            <div

                                className="time-row"

                                key={hour}

                            >



                                <div className="time-label">

                                    {formatHour(hour)}

                                </div>








                                {
                                    weekDays.map(day => (


                                        <div

                                            key={`${day}-${hour}`}

                                            className="time-slot"



                                            onMouseEnter={() =>
                                                setHoveredSlot(
                                                    `${day}-${hour}`
                                                )
                                            }


                                            onMouseLeave={() =>
                                                setHoveredSlot(null)
                                            }


                                        >



                                            {
                                                getSchedulesForSlot(
                                                    day,
                                                    hour
                                                )
                                                    .map((slot, index) => (


                                                        <div

                                                            key={index}

                                                            className="schedule-card"

                                                        >




                                                            <div className="card-title">

                                                                {
                                                                    getCourseName(
                                                                        slot.courseId
                                                                    )
                                                                }

                                                            </div>





                                                            <div className="card-time">

                                                                {slot.startTime}

                                                                -

                                                                {slot.endTime}

                                                            </div>





                                                            <div>

                                                                Trainer:

                                                                {
                                                                    getTrainerName(
                                                                        slot.trainerId
                                                                    )
                                                                }

                                                            </div>





                                                            <div>

                                                                Room:

                                                                {slot.roomNo}

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


                                    ))


                                }



                            </div>


                        ))

                    }



                </div>


            </div>


        </div>

    );

}










// import { useState } from "react";
// // import "./CSVSchedulePreview.css";


// export default function CSVSchedulePreview({

//     schedules = [],

//     AllCourses = [],
//     AllTrainers = [],

//     createSchedule,
//     token,

//     onBack

// }) {


//     // const ENABLE_IMPORT = false;
//     const ENABLE_IMPORT = true;



//     const [loading,setLoading] = useState(false);

//     const [message,setMessage] = useState("");

//     const [hoveredSlot,setHoveredSlot] = useState(null);




//     const weekDays = [
//         "Monday",
//         "Tuesday",
//         "Wednesday",
//         "Thursday",
//         "Friday",
//         "Saturday"
//     ];





//     function getCourseName(id){

//         return (
//             AllCourses.find(
//                 c=>c._id===id
//             )
//             ?.courseCode
//             ||
//             "Unknown"
//         );

//     }




//     function getTrainerName(id){

//         return (
//             AllTrainers.find(
//                 t=>t._id===id
//             )
//             ?.name
//             ||
//             "Unknown"
//         );

//     }





//     const convertHour=(time)=>{

//         if(!time)
//             return null;


//         return parseInt(
//             time.split(":")[0]
//         );

//     };





//     const formatHour=(hour)=>{


//         const date=new Date();

//         date.setHours(
//             hour,
//             0
//         );


//         return date.toLocaleTimeString(
//             "en-US",
//             {
//                 hour:"numeric",
//                 minute:"2-digit"
//             }
//         );


//     };






//     function generateTimeSlots(){


//         const hours=new Set();


//         for(let i=8;i<=17;i++){

//             hours.add(i);

//         }



//         schedules.forEach(schedule=>{


//             Object.values(
//                 schedule.slots || {}
//             )
//             .flat()
//             .forEach(slot=>{


//                 const start=
//                 convertHour(
//                     slot.startTime
//                 );


//                 const end=
//                 convertHour(
//                     slot.endTime
//                 );


//                 if(start!==null)
//                     hours.add(start);


//                 if(end!==null)
//                     hours.add(end);


//             });


//         });



//         return [...hours]
//         .sort(
//             (a,b)=>a-b
//         );


//     }




//     const timeSlots =
//     generateTimeSlots();







//     function getSchedulesForSlot(day,hour){


//         const dayKey =
//         day.toLowerCase();



//         return schedules.flatMap(
//             schedule=>{


//                 return (
//                     schedule.slots?.[dayKey]
//                     ||
//                     []
//                 )
//                 .filter(slot=>

//                     convertHour(
//                         slot.startTime
//                     )
//                     ===
//                     hour

//                 )
//                 .map(slot=>({

//                     ...slot,

//                     courseId:
//                     schedule.courseId


//                 }));



//             }
//         );


//     }








//     async function importSchedules(){


//         if(!ENABLE_IMPORT){

//             setMessage(
//                 "Import disabled (developer mode)"
//             );

//             return;

//         }



//         try{


//             setLoading(true);



//             for(
//                 const schedule
//                 of schedules
//             ){

//                 await createSchedule(
//                     schedule,
//                     token
//                 );

//             }



//             setMessage(
//                 "Schedules imported successfully"
//             );


//         }
//         catch(err){

//             setMessage(
//                 err.message
//             );

//         }
//         finally{

//             setLoading(false);

//         }


//     }








// return (

// <div className="csv-calendar-container">



// <button
// className="back-btn"
// onClick={onBack}
// >
// ← Back
// </button>




// <div className="csv-header">


// <h2>
// CSV Schedule Preview
// </h2>



// <button

// className={
// ENABLE_IMPORT
// ?
// "import-btn active"
// :
// "import-btn"
// }

// onClick={importSchedules}

// >

// {
// loading
// ?
// "Importing..."
// :
// "Import Schedules"
// }


// </button>


// </div>





// {
// message &&

// <div className="message">
// {message}
// </div>

// }






// <div className="calendar-main">



// <div className="calendar-grid">



// <div className="grid-header">


// <div className="time-label">
// TIME
// </div>



// {
// weekDays.map(day=>(

// <div
// key={day}
// className="day-header"
// >

// {day}

// </div>

// ))
// }



// </div>







// {
// timeSlots.map(hour=>(


// <div
// className="time-row"
// key={hour}
// >


// <div className="time-label">

// {formatHour(hour)}

// </div>




// {
// weekDays.map(day=>(


// <div

// key={
// `${day}-${hour}`
// }

// className="time-slot"


// onMouseEnter={()=>
// setHoveredSlot(
// `${day}-${hour}`
// )
// }

// onMouseLeave={()=>
// setHoveredSlot(null)
// }


// >


// {
// getSchedulesForSlot(
// day,
// hour
// )
// .map((slot,index)=>(



// <div

// key={index}

// className="schedule-card"

// >


// <div className="card-title">

// {
// getCourseName(
// slot.courseId
// )
// }

// </div>




// <div className="card-time">

// {slot.startTime}
// -
// {slot.endTime}

// </div>




// <div>

// Trainer:

// {
// getTrainerName(
// slot.trainerId
// )
// }

// </div>




// <div>

// Room:

// {slot.roomNo}

// </div>




// {
// slot.topic &&

// <div className="topic">

// {slot.topic}

// </div>

// }



// </div>



// ))

// }



// </div>



// ))

// }




// </div>


// ))

// }



// </div>


// </div>


// </div>

// );

// }


// // import "./CSVSchedulePreview.css";
// // import { useState } from "react";


// // export default function CSVSchedulePreview({

// //     schedules = [],

// //     AllCourses = [],
// //     AllTrainers = [],

// //     createSchedule,
// //     token,

// //     onBack

// // }) {


// //     // Developer switch
// //     const ENABLE_IMPORT = false;



// //     const days = [
// //         "monday",
// //         "tuesday",
// //         "wednesday",
// //         "thursday",
// //         "friday",
// //         "saturday"
// //     ];



// //     const [loading,setLoading] = useState(false);
// //     const [message,setMessage] = useState("");




// //     function getCourseName(id){

// //         return (
// //             AllCourses.find(
// //                 c=>c._id===id
// //             )?.courseCode
// //             ||
// //             "Unknown Course"
// //         );

// //     }



// //     function getTrainerName(id){

// //         return (
// //             AllTrainers.find(
// //                 t=>t._id===id
// //             )?.name
// //             ||
// //             "Unknown Trainer"
// //         );

// //     }





// //     function getDaySlots(day){


// //         let result=[];


// //         schedules.forEach(schedule=>{


// //             if(schedule.slots?.[day]){


// //                 schedule.slots[day]
// //                 .forEach(slot=>{


// //                     result.push({

// //                         ...slot,

// //                         courseId:
// //                         schedule.courseId

// //                     });


// //                 });


// //             }


// //         });


// //         return result;


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

// //             setMessage("");



// //             for(const schedule of schedules){


// //                 await createSchedule(
// //                     schedule,
// //                     token
// //                 );


// //             }



// //             setMessage(
// //                 `${schedules.length} schedules created successfully`
// //             );


// //         }
// //         catch(err){

// //             console.error(err);

// //             setMessage(
// //                 err.message ||
// //                 "Import failed"
// //             );

// //         }
// //         finally{

// //             setLoading(false);

// //         }


// //     }






// //     return (

// //         <div className="csv-preview-page">


// //             <button
// //                 className="back-btn"
// //                 onClick={onBack}
// //             >

// //                 ← Back

// //             </button>



// //             <div className="header">


// //                 <h2>
// //                     Schedule Preview
// //                 </h2>


// //                 <button

// //                     className={
// //                         ENABLE_IMPORT
// //                         ?
// //                         "import-btn active"
// //                         :
// //                         "import-btn"
// //                     }

// //                     onClick={importSchedules}

// //                     disabled={loading}

// //                 >

// //                     {
// //                         loading
// //                         ?
// //                         "Importing..."
// //                         :
// //                         "Import Schedules"
// //                     }

// //                 </button>


// //             </div>



// //             {
// //                 message &&

// //                 <div className="message">

// //                     {message}

// //                 </div>

// //             }





// //             <div className="calendar">


// //                 {
// //                     days.map(day=>(


// //                         <div
// //                             className="day-column"
// //                             key={day}
// //                         >


// //                             <div className="day-header">

// //                                 {
// //                                     day.toUpperCase()
// //                                 }

// //                             </div>





// //                             <div className="day-content">


// //                             {
// //                                 getDaySlots(day)
// //                                 .length===0

// //                                 ?

// //                                 <div className="empty">

// //                                     No Classes

// //                                 </div>


// //                                 :

// //                                 getDaySlots(day)
// //                                 .map((slot,index)=>(


// //                                     <div

// //                                         className="schedule-card"

// //                                         key={index}

// //                                     >


// //                                         <div className="course">

// //                                             {
// //                                                 getCourseName(
// //                                                     slot.courseId
// //                                                 )
// //                                             }

// //                                         </div>



// //                                         <div className="time">

// //                                             {slot.startTime}
// //                                             {" - "}
// //                                             {slot.endTime}

// //                                         </div>




// //                                         <div>

// //                                             Trainer:

// //                                             {
// //                                                 getTrainerName(
// //                                                     slot.trainerId
// //                                                 )
// //                                             }

// //                                         </div>



// //                                         <div>

// //                                             Room:
// //                                             {" "}
// //                                             {slot.roomNo}

// //                                         </div>




// //                                         {
// //                                             slot.topic &&

// //                                             <div className="topic">

// //                                                 {slot.topic}

// //                                             </div>

// //                                         }


// //                                     </div>


// //                                 ))

// //                             }



// //                             </div>


// //                         </div>


// //                     ))
// //                 }


// //             </div>


// //         </div>


// //     );


// // }