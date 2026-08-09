import "./CSVScheduleUpload.css";
import { useState } from "react";
import Papa from "papaparse";
import CSVSchedulePreview from "./CSVSchedulePreview";


export default function CSVScheduleUpload({

    token,

    AllCourses = [],
    AllSessions = [],
    AllTrainers = [],

    createSchedule,

    onBack

}) {


    const [file, setFile] = useState(null);

    const [schedules, setSchedules] = useState([]);

    const [showPreview, setShowPreview] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");





    function findCourse(courseCode) {

        return AllCourses.find(
            c =>
                c.courseCode &&
                c.courseCode.trim().toLowerCase()
                ===
                courseCode.trim().toLowerCase()
        );

    }





    function findTrainer(trainerName) {

        return AllTrainers.find(
            t =>
                t.name &&
                t.name.trim().toLowerCase()
                ===
                trainerName.trim().toLowerCase()
        );

    }





    function findSession(startDate, endDate) {

        return AllSessions.find(
            session => {

                const s =
                    session.startDate?.substring(0, 10);


                const e =
                    session.endDate?.substring(0, 10);



                return (

                    s === startDate.trim()

                    &&

                    e === endDate.trim()

                );


            }
        );

    }





    // Convert day into real date, constrained to the session's date range
    // function getDateFromDay(sessionStartDate, sessionEndDate, day) {


    //     const start =
    //         new Date(sessionStartDate);

    //     const end =
    //         new Date(sessionEndDate);



    //     const days = {

    //         sunday: 0,
    //         monday: 1,
    //         tuesday: 2,
    //         wednesday: 3,
    //         thursday: 4,
    //         friday: 5,
    //         saturday: 6

    //     };



    //     const targetDay =
    //         days[
    //         day.toLowerCase()
    //         ];



    //     if (targetDay === undefined) {

    //         return null;

    //     }



    //     const current =
    //         start.getDay();



    //     let difference =
    //         targetDay - current;



    //     if (difference < 0) {

    //         difference += 7;

    //     }



    //     start.setDate(
    //         start.getDate() + difference
    //     );



    //     // Reject if the resolved date falls outside the session window
    //     if (start > end) {

    //         return null;

    //     }



    //     return start
    //         .toISOString()
    //         .substring(0, 10);

    // }

    // Validate the CSV's date falls within the session's date range, normalize to YYYY-MM-DD
    function validateDate(dateStr, sessionStartDate, sessionEndDate) {

        if (!dateStr || !dateStr.trim()) {

            return null;

        }


        const parsed =
            new Date(dateStr.trim());


        if (isNaN(parsed.getTime())) {

            return null;

        }



        const start =
            new Date(sessionStartDate);


        const end =
            new Date(sessionEndDate);



        if (parsed < start || parsed > end) {

            return null;

        }



        return parsed
            .toISOString()
            .substring(0, 10);

    }



    // Compare "HH:mm" (24h) or "hh:mm AM/PM" style strings as minutes-since-midnight
    function timeToMinutes(time) {

        const clean = time.trim();

        const isPM = /pm/i.test(clean);
        const isAM = /am/i.test(clean);

        const [hPart, mPart] =
            clean
                .replace(/am|pm/i, "")
                .trim()
                .split(":");

        let hour = parseInt(hPart, 10);
        const minute = parseInt(mPart, 10) || 0;

        if (isPM && hour !== 12) hour += 12;
        if (isAM && hour === 12) hour = 0;

        return hour * 60 + minute;

    }





    function handleFile(e) {


        const uploaded =
            e.target.files[0];


        if (!uploaded)
            return;



        if (
            !uploaded.name.endsWith(".csv")
        ) {

            setError(
                "Please upload CSV file"
            );

            return;

        }


        setFile(uploaded);

        setError("");

        setSuccess("");

    }





    function processCSV() {


        if (!file) {

            setError(
                "Please select CSV file"
            );

            return;

        }




        Papa.parse(
            file,
            {

                header: true,

                skipEmptyLines: true,


                complete: (results) => {


                    try {


                        const rows =
                            results.data;



                        // const required=[

                        //     "courseCode",
                        //     "sessionStartDate",
                        //     "sessionEndDate",
                        //     "day",
                        //     "startTime",
                        //     "endTime",
                        //     "trainerName",
                        //     "roomNo"

                        // ];
                        const required = [

                            "courseCode",
                            "sessionStartDate",
                            "sessionEndDate",
                            "date",
                            "startTime",
                            "endTime",
                            "trainerName",
                            "roomNo"

                        ];



                        const missing =
                            required.filter(
                                col =>
                                    !Object.keys(rows[0])
                                        .includes(col)
                            );



                        if (missing.length) {

                            throw new Error(
                                `Missing CSV columns: ${missing.join(", ")}`
                            );

                        }






                        const finalSchedules = [];







                        rows.forEach(
                            (row, index) => {


                                const course =
                                    findCourse(
                                        row.courseCode
                                    );



                                const trainer =
                                    findTrainer(
                                        row.trainerName
                                    );



                                const session =
                                    findSession(
                                        row.sessionStartDate,
                                        row.sessionEndDate
                                    );





                                if (!course) {

                                    throw new Error(
                                        `Row ${index + 1}: Course not found`
                                    );

                                }




                                if (!trainer) {

                                    throw new Error(
                                        `Row ${index + 1}: Trainer not found`
                                    );

                                }





                                if (!session) {

                                    throw new Error(
                                        `Row ${index + 1}: Session not found`
                                    );

                                }





                                if (!row.roomNo) {

                                    throw new Error(
                                        `Row ${index + 1}: Room number missing`
                                    );

                                }





                                if (
                                    !row.startTime ||
                                    !row.endTime ||
                                    timeToMinutes(row.startTime) >= timeToMinutes(row.endTime)
                                ) {

                                    throw new Error(
                                        `Row ${index + 1}: startTime must be before endTime`
                                    );

                                }






                                // const date =
                                //     getDateFromDay(
                                //         row.sessionStartDate,
                                //         row.sessionEndDate,
                                //         row.day
                                //     );





                                // if (!date) {

                                //     throw new Error(
                                //         `Row ${index + 1}: Invalid day, or day falls outside session date range`
                                //     );

                                // }

                                const date =
                                    validateDate(
                                        row.date,
                                        row.sessionStartDate,
                                        row.sessionEndDate
                                    );





                                if (!date) {

                                    throw new Error(
                                        `Row ${index + 1}: Invalid date, or date falls outside session date range`
                                    );

                                }




                                const schedule = {


                                    courseId:
                                        course._id,



                                    sessionId:
                                        session._id,



                                    date,



                                    startTime:
                                        row.startTime.trim(),



                                    endTime:
                                        row.endTime.trim(),



                                    trainerId:
                                        trainer._id,



                                    roomNo:
                                        row.roomNo.trim(),



                                    topic:
                                        row.topic?.trim() || ""


                                };






                                // Matches Mongo unique index
                                const duplicate =
                                    finalSchedules.some(
                                        s =>

                                            s.date === schedule.date

                                            &&

                                            s.startTime === schedule.startTime

                                            &&

                                            s.roomNo === schedule.roomNo

                                    );





                                if (!duplicate) {

                                    finalSchedules.push(
                                        schedule
                                    );

                                }



                            });







                        if (
                            finalSchedules.length === 0
                        ) {

                            throw new Error(
                                "No valid schedules found"
                            );

                        }





                        setSchedules(
                            finalSchedules
                        );



                        setSuccess(
                            `${finalSchedules.length} schedules extracted`
                        );



                        setShowPreview(true);



                    }
                    catch (err) {

                        setError(
                            err.message
                        );

                    }


                }

            });


    }







    if (showPreview) {

        return (

            <CSVSchedulePreview

                schedules={schedules}

                AllCourses={AllCourses}

                AllTrainers={AllTrainers}

                createSchedule={createSchedule}

                token={token}

                onBack={() =>
                    setShowPreview(false)
                }

            />

        );

    }







    return (

        <div className="csv-upload-page">


            <button
                className="back-btn"
                onClick={onBack}
            >

                ← Back

            </button>



            <h2>
                Import Schedule From CSV
            </h2>





            {
                error &&

                <div className="error">

                    {error}

                </div>

            }




            {
                success &&

                <div className="success">

                    {success}

                </div>

            }





            <div className="upload-box">


                <input

                    type="file"

                    accept=".csv"

                    onChange={handleFile}

                />



                <button
                    onClick={processCSV}
                >

                    Read CSV

                </button>


            </div>


        </div>

    );


}












// import "./CSVScheduleUpload.css";
// import { useState } from "react";
// import Papa from "papaparse";
// import CSVSchedulePreview from "./CSVSchedulePreview";


// export default function CSVScheduleUpload({

//     token,

//     AllCourses = [],
//     AllSessions = [],
//     AllTrainers = [],

//     createSchedule,

//     onBack

// }) {


//     const [file,setFile] = useState(null);

//     const [schedules,setSchedules] = useState([]);

//     const [showPreview,setShowPreview] = useState(false);

//     const [error,setError] = useState("");

//     const [success,setSuccess] = useState("");





//     function findCourse(courseCode){

//         return AllCourses.find(
//             c =>
//                 c.courseCode &&
//                 c.courseCode.trim().toLowerCase()
//                 ===
//                 courseCode.trim().toLowerCase()
//         );

//     }





//     function findTrainer(trainerName){

//         return AllTrainers.find(
//             t =>
//                 t.name &&
//                 t.name.trim().toLowerCase()
//                 ===
//                 trainerName.trim().toLowerCase()
//         );

//     }





//     function findSession(startDate,endDate){

//         return AllSessions.find(
//             session=>{

//                 const s =
//                 session.startDate?.substring(0,10);


//                 const e =
//                 session.endDate?.substring(0,10);



//                 return (

//                     s === startDate.trim()

//                     &&

//                     e === endDate.trim()

//                 );


//             }
//         );

//     }





//     // Convert day into real date
//     function getDateFromDay(sessionStartDate,day){


//         const start =
//         new Date(sessionStartDate);



//         const days = {

//             sunday:0,
//             monday:1,
//             tuesday:2,
//             wednesday:3,
//             thursday:4,
//             friday:5,
//             saturday:6

//         };



//         const targetDay =
//         days[
//             day.toLowerCase()
//         ];



//         if(targetDay === undefined){

//             return null;

//         }



//         const current =
//         start.getDay();



//         let difference =
//         targetDay - current;



//         if(difference < 0){

//             difference += 7;

//         }



//         start.setDate(
//             start.getDate()+difference
//         );



//         return start
//         .toISOString()
//         .substring(0,10);

//     }





//     function handleFile(e){


//         const uploaded =
//         e.target.files[0];


//         if(!uploaded)
//             return;



//         if(
//             !uploaded.name.endsWith(".csv")
//         ){

//             setError(
//                 "Please upload CSV file"
//             );

//             return;

//         }


//         setFile(uploaded);

//         setError("");

//         setSuccess("");

//     }





//     function processCSV(){


//         if(!file){

//             setError(
//                 "Please select CSV file"
//             );

//             return;

//         }




//         Papa.parse(
//             file,
//             {

//             header:true,

//             skipEmptyLines:true,


//             complete:(results)=>{


//                 try{


//                     const rows =
//                     results.data;



//                     const required=[

//                         "courseCode",
//                         "sessionStartDate",
//                         "sessionEndDate",
//                         "day",
//                         "startTime",
//                         "endTime",
//                         "trainerName",
//                         "roomNo"

//                     ];



//                     const missing =
//                     required.filter(
//                         col =>
//                         !Object.keys(rows[0])
//                         .includes(col)
//                     );



//                     if(missing.length){

//                         throw new Error(
//                             `Missing CSV columns: ${missing.join(", ")}`
//                         );

//                     }






//                     const finalSchedules = [];







//                     rows.forEach(
//                     (row,index)=>{


//                         const course =
//                         findCourse(
//                             row.courseCode
//                         );



//                         const trainer =
//                         findTrainer(
//                             row.trainerName
//                         );



//                         const session =
//                         findSession(
//                             row.sessionStartDate,
//                             row.sessionEndDate
//                         );





//                         if(!course){

//                             throw new Error(
//                                 `Row ${index+1}: Course not found`
//                             );

//                         }




//                         if(!trainer){

//                             throw new Error(
//                                 `Row ${index+1}: Trainer not found`
//                             );

//                         }





//                         if(!session){

//                             throw new Error(
//                                 `Row ${index+1}: Session not found`
//                             );

//                         }





//                         if(!row.roomNo){

//                             throw new Error(
//                                 `Row ${index+1}: Room number missing`
//                             );

//                         }






//                         const date =
//                         getDateFromDay(
//                             row.sessionStartDate,
//                             row.day
//                         );





//                         if(!date){

//                             throw new Error(
//                                 `Row ${index+1}: Invalid day`
//                             );

//                         }






//                         const schedule = {


//                             courseId:
//                             course._id,



//                             sessionId:
//                             session._id,



//                             date,



//                             startTime:
//                             row.startTime.trim(),



//                             endTime:
//                             row.endTime.trim(),



//                             trainerId:
//                             trainer._id,



//                             roomNo:
//                             row.roomNo.trim(),



//                             topic:
//                             row.topic?.trim() || ""


//                         };






//                         // Matches Mongo unique index
//                         const duplicate =
//                         finalSchedules.some(
//                             s =>

//                             s.date === schedule.date

//                             &&

//                             s.startTime === schedule.startTime

//                             &&

//                             s.roomNo === schedule.roomNo

//                         );





//                         if(!duplicate){

//                             finalSchedules.push(
//                                 schedule
//                             );

//                         }



//                     });







//                     if(
//                         finalSchedules.length===0
//                     ){

//                         throw new Error(
//                             "No valid schedules found"
//                         );

//                     }





//                     setSchedules(
//                         finalSchedules
//                     );



//                     setSuccess(
//                         `${finalSchedules.length} schedules extracted`
//                     );



//                     setShowPreview(true);



//                 }
//                 catch(err){

//                     setError(
//                         err.message
//                     );

//                 }


//             }

//         });


//     }







//     if(showPreview){

//         return (

//             <CSVSchedulePreview

//                 schedules={schedules}

//                 AllCourses={AllCourses}

//                 AllTrainers={AllTrainers}

//                 createSchedule={createSchedule}

//                 token={token}

//                 onBack={()=>
//                     setShowPreview(false)
//                 }

//             />

//         );

//     }







//     return (

//         <div className="csv-upload-page">


//             <button
//                 className="back-btn"
//                 onClick={onBack}
//             >

//                 ← Back

//             </button>



//             <h2>
//                 Import Schedule From CSV
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





//             <div className="upload-box">


//                 <input

//                     type="file"

//                     accept=".csv"

//                     onChange={handleFile}

//                 />



//                 <button
//                     onClick={processCSV}
//                 >

//                     Read CSV

//                 </button>


//             </div>


//         </div>

//     );


// }










// // import "./CSVScheduleUpload.css";
// // import { useState } from "react";
// // import Papa from "papaparse";
// // import CSVSchedulePreview from "./CSVSchedulePreview";


// // export default function CSVScheduleUpload({

// //     token,

// //     AllCourses = [],
// //     AllSessions = [],
// //     AllTrainers = [],

// //     createSchedule,

// //     onBack

// // }) {


// //     const [file,setFile] = useState(null);

// //     const [schedules,setSchedules] = useState([]);

// //     const [showPreview,setShowPreview] = useState(false);

// //     const [error,setError] = useState("");

// //     const [success,setSuccess] = useState("");





// //     function findCourse(courseCode){

// //         if(!courseCode)
// //             return null;


// //         return AllCourses.find(
// //             c =>
// //             c.courseCode &&
// //             c.courseCode.toLowerCase()
// //             ===
// //             courseCode.toLowerCase()
// //         );

// //     }





// //     function findTrainer(trainerName){

// //         if(!trainerName)
// //             return null;


// //         return AllTrainers.find(
// //             t =>
// //             t.name &&
// //             t.name.toLowerCase()
// //             ===
// //             trainerName.toLowerCase()
// //         );

// //     }





// //     function findSession(startDate,endDate){

// //         if(!startDate || !endDate)
// //             return null;


// //         return AllSessions.find(session=>{


// //             const sessionStart =
// //             session.startDate.substring(0,10);


// //             const sessionEnd =
// //             session.endDate.substring(0,10);



// //             return (

// //                 sessionStart === startDate

// //                 &&

// //                 sessionEnd === endDate

// //             );


// //         });


// //     }





// //     function handleFile(e){

// //         const uploadedFile =
// //         e.target.files[0];


// //         setFile(uploadedFile);

// //         setError("");

// //         setSuccess("");

// //     }





// //     function processCSV(){


// //         if(!file){

// //             setError(
// //                 "Please select CSV file"
// //             );

// //             return;

// //         }




// //         Papa.parse(file,{

// //             header:true,

// //             skipEmptyLines:true,


// //             complete:(results)=>{


// //                 try{


// //                     const rows =
// //                     results.data;


// //                     const scheduleMap={};




// //                     rows.forEach(row=>{


// //                         const course =
// //                         findCourse(
// //                             row.courseCode
// //                         );



// //                         const trainer =
// //                         findTrainer(
// //                             row.trainerName
// //                         );



// //                         const session =
// //                         findSession(
// //                             row.sessionStartDate,
// //                             row.sessionEndDate
// //                         );



// //                         if(!course){

// //                             throw new Error(
// //                                 `Course not found: ${row.courseCode}`
// //                             );

// //                         }



// //                         if(!trainer){

// //                             throw new Error(
// //                                 `Trainer not found: ${row.trainerName}`
// //                             );

// //                         }



// //                         if(!session){

// //                             throw new Error(
// //                                 `Session not found: ${row.sessionStartDate} - ${row.sessionEndDate}`
// //                             );

// //                         }




// //                         const key =
// //                         `${course._id}_${session._id}`;





// //                         if(!scheduleMap[key]){


// //                             scheduleMap[key]={


// //                                 courseId:
// //                                 course._id,


// //                                 sessionId:
// //                                 session._id,


// //                                 slots:{}


// //                             };


// //                         }




// //                         if(
// //                             !scheduleMap[key]
// //                             .slots[row.day]
// //                         ){

// //                             scheduleMap[key]
// //                             .slots[row.day]=[];

// //                         }




// //                         scheduleMap[key]
// //                         .slots[row.day]
// //                         .push({


// //                             startTime:
// //                             row.startTime,


// //                             endTime:
// //                             row.endTime,


// //                             trainerId:
// //                             trainer._id,


// //                             roomNo:
// //                             row.roomNo,


// //                             topic:
// //                             row.topic || ""


// //                         });



// //                     });




// //                     const finalSchedules =
// //                     Object.values(scheduleMap);




// //                     setSchedules(
// //                         finalSchedules
// //                     );



// //                     setSuccess(
// //                         `${finalSchedules.length} schedules extracted`
// //                     );



// //                     setShowPreview(true);



// //                 }
// //                 catch(err){

// //                     setError(
// //                         err.message
// //                     );

// //                 }


// //             }


// //         });


// //     }





// //     if(showPreview){


// //         return (

// //             <CSVSchedulePreview

// //                 schedules={schedules}


// //                 AllCourses={AllCourses}

// //                 AllTrainers={AllTrainers}


// //                 createSchedule={createSchedule}

// //                 token={token}


// //                 onBack={()=>
// //                     setShowPreview(false)
// //                 }

// //             />

// //         );


// //     }






// //     return (

// //         <div className="csv-upload-page">


// //             <button

// //                 className="back-btn"

// //                 onClick={onBack}

// //             >

// //                 ← Back

// //             </button>





// //             <h2>
// //                 Import Schedule From CSV
// //             </h2>





// //             {
// //                 error &&

// //                 <div className="error">

// //                     {error}

// //                 </div>

// //             }





// //             {
// //                 success &&

// //                 <div className="success">

// //                     {success}

// //                 </div>

// //             }






// //             <div className="upload-box">


// //                 <input

// //                     type="file"

// //                     accept=".csv"

// //                     onChange={handleFile}

// //                 />



// //                 <button

// //                     onClick={processCSV}

// //                 >

// //                     Read CSV

// //                 </button>



// //             </div>



// //         </div>

// //     );

// // }






// // // import "./CSVScheduleUpload.css";
// // // import { useState } from "react";
// // // import Papa from "papaparse";


// // // export default function CSVScheduleUpload({

// // //     AllCourses = [],
// // //     AllSessions = [],
// // //     AllTrainers = [],
// // //     onBack

// // // }) {


// // //     const [file,setFile] = useState(null);

// // //     const [schedules,setSchedules] = useState([]);

// // //     const [error,setError] = useState("");

// // //     const [success,setSuccess] = useState("");





// // //     // function findCourse(courseCode){

// // //     //     return AllCourses.find(
// // //     //         c =>
// // //     //         c.courseCode.toLowerCase()
// // //     //         === courseCode.toLowerCase()
// // //     //     );

// // //     // }

// // // function findCourse(courseCode){

// // //     if(!courseCode)
// // //         return null;


// // //     return AllCourses.find(
// // //         c =>
// // //         c.courseCode &&
// // //         c.courseCode.toLowerCase()
// // //         ===
// // //         courseCode.toLowerCase()
// // //     );

// // // }

// // // function findTrainer(trainerName){

// // //     if(!trainerName)
// // //         return null;


// // //     return AllTrainers.find(
// // //         t =>
// // //         t.name &&
// // //         t.name.toLowerCase()
// // //         ===
// // //         trainerName.toLowerCase()
// // //     );

// // // }

// // // // function findSession(startDate,endDate){

// // // //     if(!startDate || !endDate)
// // // //         return null;


// // // //     return AllSessions.find(
// // // //         s =>

// // // //         s.startDate.substring(0,10)
// // // //         === startDate

// // // //         &&

// // // //         s.endDate.substring(0,10)
// // // //         === endDate

// // // //     );

// // // // }
// // // function findSession(startDate, endDate){

// // //     if(!startDate || !endDate)
// // //         return null;


// // //     return AllSessions.find(session => {

// // //         const sessionStart =
// // //         session.startDate.substring(0,10);


// // //         const sessionEnd =
// // //         session.endDate.substring(0,10);



// // //         return (
// // //             sessionStart === startDate &&
// // //             sessionEnd === endDate
// // //         );

// // //     });

// // // }




// // //     function handleFile(e){

// // //         const uploadedFile = e.target.files[0];

// // //         setFile(uploadedFile);

// // //         setError("");

// // //     }





// // //     function processCSV(){


// // //         if(!file){

// // //             setError(
// // //                 "Please select CSV file"
// // //             );

// // //             return;

// // //         }




// // //         Papa.parse(file,{

// // //             header:true,

// // //             skipEmptyLines:true,


// // //             complete:(results)=>{


// // //                 try{


// // //                     const rows = results.data;


// // //                     console.log(
// // //                         "CSV Rows:",
// // //                         rows
// // //                     );



// // //                     const scheduleMap={};



// // //                     rows.forEach(row=>{


// // //                         const course =
// // //                         findCourse(
// // //                             row.courseCode
// // //                         );


// // //                         const trainer =
// // //                         findTrainer(
// // //                             row.trainerName
// // //                         );


// // //                        const session =
// // //                             findSession(
// // //                                 row.sessionStartDate,
// // //                                 row.sessionEndDate
// // //                             );



// // //                         if(!course){

// // //                             throw new Error(
// // //                                 `Course not found: ${row.courseCode}`
// // //                             );

// // //                         }



// // //                         if(!trainer){

// // //                             throw new Error(
// // //                                 `Trainer not found: ${row.trainerName}`
// // //                             );

// // //                         }



// // //                         if(!session){

// // //                             throw new Error(
// // //                                 `Session not found: ${row.sessionName}`
// // //                             );

// // //                         }




// // //                         const key =
// // //                         `${course._id}_${session._id}`;




// // //                         if(!scheduleMap[key]){


// // //                             scheduleMap[key]={

// // //                                 courseId:
// // //                                 course._id,


// // //                                 sessionId:
// // //                                 session._id,


// // //                                 slots:{}

// // //                             };


// // //                         }




// // //                         if(
// // //                             !scheduleMap[key]
// // //                             .slots[row.day]
// // //                         ){

// // //                             scheduleMap[key]
// // //                             .slots[row.day]=[];

// // //                         }




// // //                         scheduleMap[key]
// // //                         .slots[row.day]
// // //                         .push({

// // //                             startTime:
// // //                             row.startTime,


// // //                             endTime:
// // //                             row.endTime,


// // //                             trainerId:
// // //                             trainer._id,


// // //                             roomNo:
// // //                             row.roomNo,


// // //                             topic:
// // //                             row.topic || ""

// // //                         });



// // //                     });




// // //                     const finalSchedules =
// // //                     Object.values(scheduleMap);



// // //                     setSchedules(
// // //                         finalSchedules
// // //                     );


// // //                     setSuccess(
// // //                         `${finalSchedules.length} schedules extracted`
// // //                     );



// // //                     console.log(
// // //                         "Converted schedules:",
// // //                         finalSchedules
// // //                     );



// // //                 }
// // //                 catch(err){

// // //                     setError(
// // //                         err.message
// // //                     );

// // //                 }


// // //             }


// // //         });


// // //     }





// // //     return (

// // //         <div className="csv-upload-page">


// // //             <button
// // //                 className="back-btn"
// // //                 onClick={onBack}
// // //             >
// // //                 ← Back
// // //             </button>




// // //             <h2>
// // //                 Import Schedule From CSV
// // //             </h2>




// // //             {
// // //                 error &&
// // //                 <div className="error">
// // //                     {error}
// // //                 </div>
// // //             }




// // //             {
// // //                 success &&
// // //                 <div className="success">
// // //                     {success}
// // //                 </div>
// // //             }




// // //             <div className="upload-box">


// // //                 <input

// // //                     type="file"

// // //                     accept=".csv"

// // //                     onChange={handleFile}

// // //                 />



// // //                 <button

// // //                     onClick={processCSV}

// // //                 >

// // //                     Read CSV

// // //                 </button>


// // //             </div>





// // //             {
// // //                 schedules.length>0 &&

// // //                 <div className="preview">


// // //                     <h3>
// // //                         Generated Schedule JSON
// // //                     </h3>


// // //                     <pre>

// // //                         {
// // //                             JSON.stringify(
// // //                                 schedules,
// // //                                 null,
// // //                                 2
// // //                             )
// // //                         }

// // //                     </pre>


// // //                 </div>

// // //             }




// // //         </div>

// // //     );

// // // }