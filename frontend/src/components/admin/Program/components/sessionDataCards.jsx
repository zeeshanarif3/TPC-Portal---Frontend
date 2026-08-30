import { useDashboard } from "../../../../hooks/useDashboard";
import "./sessionDataCards.css";

export default function SessionDataCards({
    token,
    selectedSession,
    setSelectedSession,
}) {
    const {
        AllSessions = [],
        AllSlots = [],
        AllTrainers = [],
    } = useDashboard(token);


    const selectedSessionData = AllSessions.find(
        (session) => session._id === selectedSession
    );

    const sessionSlots = AllSlots.filter(
        (slot) => slot.sessionId?._id === selectedSession
    );
    const totalScheduledSlots = sessionSlots.length;

    const completedSlots = sessionSlots.filter(
        (slot) => slot.status === "completed"
    );

    const cancelledSlots = sessionSlots.filter(
        (slot) => slot.status === "cancelled"
    );

    const ongoingSlots = sessionSlots.filter(
        (slot) => slot.status === "ongoing"
    );
    const pendingSlots = sessionSlots.filter(
        (slot) =>
            slot.status === "scheduled" ||
            slot.status === "ongoing"
    );


    const totalHours = totalScheduledSlots;

    const completedHours = completedSlots.length;

    const cancelledHours = cancelledSlots.length;

    const pendingHours = pendingSlots.length;


    const activeSlots = sessionSlots.filter(
        (slot) => slot.status !== "cancelled"
    );

    const activeHours = activeSlots.length;

    const completionPercentage =
        activeHours > 0
            ? Math.round((completedHours / activeHours) * 100)
            : 0;

    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };


    return (
        <div className="cards">


            {!selectedSessionData ? (
                <div className="sessionTimeCard">
                    <span>Please select a session</span>
                </div>
            ) : (
                <div className="sessionTimeCard">

                    <div className="sessionTimeItem">
                        <span className="sessionTimeLabel">
                            SESSION START
                        </span>

                        <span className="sessionTimeValue">
                            {formatDate(selectedSessionData.startDate)}
                        </span>
                    </div>

                    <div className="sessionTimeDivider" />

                    <div className="sessionTimeItem">
                        <span className="sessionTimeLabel">
                            SESSION END
                        </span>

                        <span className="sessionTimeValue">
                            {formatDate(selectedSessionData.endDate)}
                        </span>
                    </div>

                </div>
            )}


            <div className="hoursOfSchedule">

                <div className="hoursHeader">
                    <span>SCHEDULE HOURS</span>
                </div>

                <div className="hoursContent">

                    <div className="hoursMain">
                        <strong>{completedHours}</strong>

                        <span>
                            / {activeHours} hrs
                        </span>
                    </div>

                    <div className="hoursLabel">
                        {activeHours === 0
                            ? "No scheduled hours"
                            : `${completionPercentage}% completed`}
                    </div>


                    <div className="hoursProgress">
                        <div
                            className="hoursProgressFill"
                            style={{
                                width: `${completionPercentage}%`,
                            }}
                        />
                    </div>


                    <div className="hoursDetails">

                        <div className="hoursDetailItem">
                            <span>Total</span>
                            <strong>
                                {activeHours} hrs
                            </strong>
                        </div>

                        <div className="hoursDetailItem">
                            <span>Completed</span>
                            <strong>
                                {completedHours} hrs
                            </strong>
                        </div>

                        <div className="hoursDetailItem">
                            <span>Remaining</span>
                            <strong>
                                {pendingHours} hrs
                            </strong>
                        </div>

                        {cancelledHours > 0 && (
                            <div className="hoursDetailItem">
                                <span>Cancelled</span>
                                <strong>
                                    {cancelledHours} hrs
                                </strong>
                            </div>
                        )}

                    </div>

                </div>

            </div>





            

        </div>
    );
}








// import { useDashboard } from "../../../../hooks/useDashboard";
// import "./sessionDataCards.css";

// export default function SessionDataCards({
//     token,
//     selectedSession,
//     setSelectedSession,
// }) {
//     const {
//         AllSessions = [],
//         AllSlots = [],
//     } = useDashboard(token);

//     // Find selected session
//     const selectedSessionData = AllSessions.find(
//         (session) => session._id === selectedSession
//     );

//     // Format date
//     const formatDate = (date) => {
//         if (!date) return "—";

//         const parsedDate = new Date(date);

//         if (isNaN(parsedDate.getTime())) return "—";

//         return parsedDate.toLocaleDateString("en-IN", {
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//         });
//     };

// const sessionSlots = AllSlots.filter(
//     (slot) => slot.sessionId?._id === selectedSession
// );

// // Exclude cancelled schedules
// const validSlots = sessionSlots.filter(
//     (slot) => slot.status !== "cancelled"
// );

// const totalHours = validSlots.length;

// const completedHours = validSlots.filter(
//     (slot) => slot.status === "completed"
// ).length;

// const remainingHours = totalHours - completedHours;

//     return (
//         <div className="cards">

//             {/* SESSION DATES */}
//             {!selectedSessionData ? (
//                 <div className="sessionTimeCard">
//                     <span>Please select a session</span>
//                 </div>
//             ) : (
//                 <div className="sessionTimeCard">

//                     <div className="sessionTimeItem">
//                         <span className="sessionTimeLabel">
//                             SESSION START
//                         </span>

//                         <span className="sessionTimeValue">
//                             {formatDate(selectedSessionData.startDate)}
//                         </span>
//                     </div>

//                     <div className="sessionTimeDivider"></div>

//                     <div className="sessionTimeItem">
//                         <span className="sessionTimeLabel">
//                             SESSION END
//                         </span>

//                         <span className="sessionTimeValue">
//                             {formatDate(selectedSessionData.endDate)}
//                         </span>
//                     </div>

//                 </div>
//             )}
//             <div className="hoursOfSchedule">
//     <div className="hoursHeader">
//         <span>SCHEDULE HOURS</span>
//     </div>

//     <div className="hoursContent">

//         <div className="hoursMain">
//             <strong>{completedHours}</strong>
//             <span>/ {totalHours} hrs</span>
//         </div>

//         <div className="hoursLabel">
//             {remainingHours > 0
//                 ? `${remainingHours} hours remaining`
//                 : "Session completed"}
//         </div>

//     </div>
// </div>

//         </div>
//     );
// }







// // import { useMemo, useState } from 'react';
// // import { useDashboard } from "../../../../hooks/useDashboard";
// // import './sessionDataCards.css';

// // export default function SessionDataCards({ token, selectedSession, setSelectedSession }) {
// //     const {
// //         AllSessions = [],
// //         AllSlots = [],

// //     } = useDashboard(token);

// //     //   const [selectedSession, setSelectedSession] = useState(null);
// //     const selectedSessionData = AllSessions?.find(
// //         (session) => session._id === selectedSession
// //     );
// //     const formatDate = (date) => {
// //         if (!date) return "—";

// //         const parsedDate = new Date(date);

// //         if (isNaN(parsedDate.getTime())) return "—";

// //         return parsedDate.toLocaleDateString("en-IN", {
// //             day: "2-digit",
// //             month: "short",
// //             year: "numeric",
// //         });
// //     };
// //     const sessionSlots = AllSlots?.filter(
// //         (slot) => slot.sessionId?._id === selectedSession
// //     ) || [];

// //     const totalHours = sessionSlots.length;

// //     const completedHours = sessionSlots.filter(
// //         (slot) => slot.status === "completed"
// //     ).length;

// //     return (
// //         <div className="cards">

// //             {!(selectedSessionData) ? (
// //                 <div className="sessionTimeCard">
// //                     please select a session
// //                 </div>) : (
// //                 <div className="sessionTimeCard">
// //                     <div className="sessionTimeItem">
// //                         <span className="sessionTimeLabel">SESSION START</span>
// //                         <span className="sessionTimeValue">
// //                             {formatDate(selectedSessionData.startDate)}
// //                         </span>
// //                     </div>

// //                     <div className="sessionTimeDivider"></div>

// //                     <div className="sessionTimeItem">
// //                         <span className="sessionTimeLabel">SESSION END</span>
// //                         <span className="sessionTimeValue">
// //                             {formatDate(selectedSessionData.endDate)}
// //                         </span>
// //                     </div>
// //                 </div>
// //             )}

// //             <div className="hoursOfSchedule">
// //                 <div className="hoursHeader">
// //                     <span>Schedule Hours</span>
// //                 </div>

// //                 <div className="hoursContent">
// //                     <div className="hoursMain">
// //                         <strong>{completedHours}</strong>
// //                         <span> / {totalHours} hrs</span>
// //                     </div>

// //                     <div className="hoursLabel">
// //                         Completed
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>


// //     );
// // }



































