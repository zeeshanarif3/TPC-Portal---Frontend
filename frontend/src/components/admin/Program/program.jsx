
import { useMemo, useState } from 'react';
import { useDashboard } from "../../../hooks/useDashboard";
import SessionCard from './components/sessionCard';
import SessionDataCards from './components/sessionDataCards'
import TrainerChart from './components/trainerchart'
import TopicCard from './components/topicCard'
import './program.css';

export default function Program({ token }) {
  const {
    colleges = [],
    AllSessions = [],
  } = useDashboard(token);

  const [selectedCollege, setSelectedCollege] = useState("all");
  const [selectedSession, setSelectedSession] = useState(null);

  // Filter sessions based on selected college
  const filteredSessions = useMemo(() => {
    if (selectedCollege === "all") {
      return AllSessions;
    }

    return AllSessions.filter(
      (session) => session.collegeId?._id === selectedCollege
    );
  }, [AllSessions, selectedCollege]);

  // Handle session selection
  const handleSessionClick = (sessionId) => {
    setSelectedSession(sessionId);
  };
//   const selectedSessionData = AllSessions?.find(
//   (session) => session._id === selectedSession
// );

// const formatDate = (date) => {
//   if (!date) return "—";

//   const parsedDate = new Date(date);

//   if (isNaN(parsedDate.getTime())) return "—";

//   return parsedDate.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

  return (
    <div className="programContainer">
      {/* <pre>{JSON.stringify(selectedSession, null, 2)}</pre> */}

      <div className="selectorContainer">

        <div className="sp-header">
          <div className="sp-header-titles">
            <h1 className="sp-title">Select college</h1>
          </div>

          <div className="sp-filters">
            <select
              className="sp-select"
              value={selectedCollege}
              onChange={(e) => {
                setSelectedCollege(e.target.value);
                setSelectedSession(null);
              }}
            >
              <option value="all">All Colleges</option>

              {colleges.map((college) => (
                <option
                  key={college._id}
                  value={college._id}
                >
                  {college.name}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      <div className="topLayer">

        <div className="leftPart">         
            <SessionDataCards token={token} selectedSession={selectedSession} setSelectedSession={setSelectedSession}/>
        </div>

        <div className="rightpart">
          <div className="charts">
            <TrainerChart token={token} selectedSession={selectedSession} />
          </div>
        </div>

      </div>

      <div className="middleLayer">
        <div className="cardContainer">

          <div className="sessionCards">

            {filteredSessions.map((session) => (
              <SessionCard
              key={session._id}
              session={session}
              onClick={() => handleSessionClick(session._id)}
              selected={selectedSession === session._id}
              />
            ))}

          </div>

        </div>



          <TopicCard token={token} selectedSession={selectedSession} />

      </div>

    </div>
  );
}






















// import { useMemo, useState } from 'react';
// import { useDashboard } from "../../../hooks/useDashboard";
// import SessionCard from './components/sessionCard';
// import './program.css';

// export default function Program({ token }) {
//   const {
//     colleges = [],
//     AllSessions = [],
//   } = useDashboard(token);

//   const [selectedCollege, setSelectedCollege] = useState("all");

//   // Filter sessions based on selected college
//   const filteredSessions = useMemo(() => {
//     if (selectedCollege === "all") {
//       return AllSessions;
//     }

//     return AllSessions.filter(
//       (session) => session.collegeId?._id === selectedCollege
//     );
//   }, [AllSessions, selectedCollege]);

//   return (
//     <div className="programContainer">

//       <div className="selectorContainer">

//         <div className="sp-header">

//           <div className="sp-header-titles">
//             <h1 className="sp-title">Select college</h1>
//           </div>

//           <div className="sp-filters">

//             <select
//               className="sp-select"
//               value={selectedCollege}
//               onChange={(e) => setSelectedCollege(e.target.value)}
//             >
//               <option value="all">All Colleges</option>

//               {colleges.map((college) => (
//                 <option
//                   key={college._id}
//                   value={college._id}
//                 >
//                   {college.name}
//                 </option>
//               ))}
//             </select>

//           </div>

//         </div>

//       </div>

//       <div className="topLayer">

//         <div className="leftPart">
//           <div className="cards">
//             a
//           </div>
//         </div>

//         <div className="rightpart">
//           <div className="charts">
//             a
//           </div>
//         </div>

//       </div>

//       <div className="middleLayer">

//         <div className="sessionCards">

//           {filteredSessions.map((session) => (
//             <SessionCard
//               key={session._id}
//               session={session}
//             />
//           ))}

//         </div>

//       </div>

//     </div>
//   );
// }









// // import { useState } from 'react';
// // import { useDashboard } from "../../../hooks/useDashboard";
// // import SessionCard from './components/sessionCard'
// // import './program.css';


// // export default function Program({ token }) {
// //   const {
// //     colleges = [],
// //     AllSessions=[],
// //   } = useDashboard(token);
// //   const [selectedCollege, setSelectedCollege] = useState("all");

// //   return (
// //     <div className='programContainer'>
// //       <div className="selectorContainer">

// //         <div className="sp-header">
// //           <div className="sp-header-titles">
// //             <h1 className="sp-title">Select college</h1>
// //           </div>

// //           <div className="sp-filters">
// //             <select
// //               className="sp-select"
// //               value={selectedCollege}
// //               onChange={(e) => setSelectedCollege(e.target.value)}
// //             >
// //               <option value="all">All Colleges</option>
// //               {colleges.map((college) => (
// //                 <option key={college._id} value={college._id}>
// //                   {college.name}
// //                 </option>
// //               ))}
// //             </select>

// //           </div>
// //         </div>

// //       </div>

// //         <div className="topLayer">
// //           <div className="leftPart">
// //             <div className="cards">
// //               a
// //             </div>
// //           </div>
// //           <div className="rightpart">
// //             <div className="charts">
// //               a
// //             </div>
// //           </div>
// //         </div>
// //         <div className="middleLayer">
// //               <div className="sessionCards">
                
// //                 {/* <SessionCard session={AllSessions[0]}/> */}
// //                 {AllSessions.map((session) => (
// //                   <SessionCard
// //                     key={session._id}
// //                     session={session}
// //                   />
// //                 ))}
// //               </div>
// //         </div>


// //     </div>
// //   );
// // }















