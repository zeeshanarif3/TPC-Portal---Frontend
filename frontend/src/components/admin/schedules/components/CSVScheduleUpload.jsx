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


    const [file,setFile] = useState(null);

    const [schedules,setSchedules] = useState([]);

    const [showPreview,setShowPreview] = useState(false);

    const [error,setError] = useState("");

    const [success,setSuccess] = useState("");





    function findCourse(courseCode){

        if(!courseCode)
            return null;


        return AllCourses.find(
            c =>
            c.courseCode &&
            c.courseCode.toLowerCase()
            ===
            courseCode.toLowerCase()
        );

    }





    function findTrainer(trainerName){

        if(!trainerName)
            return null;


        return AllTrainers.find(
            t =>
            t.name &&
            t.name.toLowerCase()
            ===
            trainerName.toLowerCase()
        );

    }





    function findSession(startDate,endDate){

        if(!startDate || !endDate)
            return null;


        return AllSessions.find(session=>{


            const sessionStart =
            session.startDate.substring(0,10);


            const sessionEnd =
            session.endDate.substring(0,10);



            return (

                sessionStart === startDate

                &&

                sessionEnd === endDate

            );


        });


    }





    function handleFile(e){

        const uploadedFile =
        e.target.files[0];


        setFile(uploadedFile);

        setError("");

        setSuccess("");

    }





    function processCSV(){


        if(!file){

            setError(
                "Please select CSV file"
            );

            return;

        }




        Papa.parse(file,{

            header:true,

            skipEmptyLines:true,


            complete:(results)=>{


                try{


                    const rows =
                    results.data;


                    const scheduleMap={};




                    rows.forEach(row=>{


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



                        if(!course){

                            throw new Error(
                                `Course not found: ${row.courseCode}`
                            );

                        }



                        if(!trainer){

                            throw new Error(
                                `Trainer not found: ${row.trainerName}`
                            );

                        }



                        if(!session){

                            throw new Error(
                                `Session not found: ${row.sessionStartDate} - ${row.sessionEndDate}`
                            );

                        }




                        const key =
                        `${course._id}_${session._id}`;





                        if(!scheduleMap[key]){


                            scheduleMap[key]={


                                courseId:
                                course._id,


                                sessionId:
                                session._id,


                                slots:{}


                            };


                        }




                        if(
                            !scheduleMap[key]
                            .slots[row.day]
                        ){

                            scheduleMap[key]
                            .slots[row.day]=[];

                        }




                        scheduleMap[key]
                        .slots[row.day]
                        .push({


                            startTime:
                            row.startTime,


                            endTime:
                            row.endTime,


                            trainerId:
                            trainer._id,


                            roomNo:
                            row.roomNo,


                            topic:
                            row.topic || ""


                        });



                    });




                    const finalSchedules =
                    Object.values(scheduleMap);




                    setSchedules(
                        finalSchedules
                    );



                    setSuccess(
                        `${finalSchedules.length} schedules extracted`
                    );



                    setShowPreview(true);



                }
                catch(err){

                    setError(
                        err.message
                    );

                }


            }


        });


    }





    if(showPreview){


        return (

            <CSVSchedulePreview

                schedules={schedules}


                AllCourses={AllCourses}

                AllTrainers={AllTrainers}


                createSchedule={createSchedule}

                token={token}


                onBack={()=>
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


// export default function CSVScheduleUpload({

//     AllCourses = [],
//     AllSessions = [],
//     AllTrainers = [],
//     onBack

// }) {


//     const [file,setFile] = useState(null);

//     const [schedules,setSchedules] = useState([]);

//     const [error,setError] = useState("");

//     const [success,setSuccess] = useState("");





//     // function findCourse(courseCode){

//     //     return AllCourses.find(
//     //         c =>
//     //         c.courseCode.toLowerCase()
//     //         === courseCode.toLowerCase()
//     //     );

//     // }

// function findCourse(courseCode){

//     if(!courseCode)
//         return null;


//     return AllCourses.find(
//         c =>
//         c.courseCode &&
//         c.courseCode.toLowerCase()
//         ===
//         courseCode.toLowerCase()
//     );

// }

// function findTrainer(trainerName){

//     if(!trainerName)
//         return null;


//     return AllTrainers.find(
//         t =>
//         t.name &&
//         t.name.toLowerCase()
//         ===
//         trainerName.toLowerCase()
//     );

// }

// // function findSession(startDate,endDate){

// //     if(!startDate || !endDate)
// //         return null;


// //     return AllSessions.find(
// //         s =>

// //         s.startDate.substring(0,10)
// //         === startDate

// //         &&

// //         s.endDate.substring(0,10)
// //         === endDate

// //     );

// // }
// function findSession(startDate, endDate){

//     if(!startDate || !endDate)
//         return null;


//     return AllSessions.find(session => {

//         const sessionStart =
//         session.startDate.substring(0,10);


//         const sessionEnd =
//         session.endDate.substring(0,10);



//         return (
//             sessionStart === startDate &&
//             sessionEnd === endDate
//         );

//     });

// }




//     function handleFile(e){

//         const uploadedFile = e.target.files[0];

//         setFile(uploadedFile);

//         setError("");

//     }





//     function processCSV(){


//         if(!file){

//             setError(
//                 "Please select CSV file"
//             );

//             return;

//         }




//         Papa.parse(file,{

//             header:true,

//             skipEmptyLines:true,


//             complete:(results)=>{


//                 try{


//                     const rows = results.data;


//                     console.log(
//                         "CSV Rows:",
//                         rows
//                     );



//                     const scheduleMap={};



//                     rows.forEach(row=>{


//                         const course =
//                         findCourse(
//                             row.courseCode
//                         );


//                         const trainer =
//                         findTrainer(
//                             row.trainerName
//                         );


//                        const session =
//                             findSession(
//                                 row.sessionStartDate,
//                                 row.sessionEndDate
//                             );



//                         if(!course){

//                             throw new Error(
//                                 `Course not found: ${row.courseCode}`
//                             );

//                         }



//                         if(!trainer){

//                             throw new Error(
//                                 `Trainer not found: ${row.trainerName}`
//                             );

//                         }



//                         if(!session){

//                             throw new Error(
//                                 `Session not found: ${row.sessionName}`
//                             );

//                         }




//                         const key =
//                         `${course._id}_${session._id}`;




//                         if(!scheduleMap[key]){


//                             scheduleMap[key]={

//                                 courseId:
//                                 course._id,


//                                 sessionId:
//                                 session._id,


//                                 slots:{}

//                             };


//                         }




//                         if(
//                             !scheduleMap[key]
//                             .slots[row.day]
//                         ){

//                             scheduleMap[key]
//                             .slots[row.day]=[];

//                         }




//                         scheduleMap[key]
//                         .slots[row.day]
//                         .push({

//                             startTime:
//                             row.startTime,


//                             endTime:
//                             row.endTime,


//                             trainerId:
//                             trainer._id,


//                             roomNo:
//                             row.roomNo,


//                             topic:
//                             row.topic || ""

//                         });



//                     });




//                     const finalSchedules =
//                     Object.values(scheduleMap);



//                     setSchedules(
//                         finalSchedules
//                     );


//                     setSuccess(
//                         `${finalSchedules.length} schedules extracted`
//                     );



//                     console.log(
//                         "Converted schedules:",
//                         finalSchedules
//                     );



//                 }
//                 catch(err){

//                     setError(
//                         err.message
//                     );

//                 }


//             }


//         });


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





//             {
//                 schedules.length>0 &&

//                 <div className="preview">


//                     <h3>
//                         Generated Schedule JSON
//                     </h3>


//                     <pre>

//                         {
//                             JSON.stringify(
//                                 schedules,
//                                 null,
//                                 2
//                             )
//                         }

//                     </pre>


//                 </div>

//             }




//         </div>

//     );

// }