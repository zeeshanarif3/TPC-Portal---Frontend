import './TrainT.css';

export default function TrainT({ trainers = [] }) {
  return (
    <div className="train-table">
      <div className="train-table__header">
        <h3 className="train-table__title">Trainers</h3>
      </div>

      <table className="train-table__table">
        <thead className="train-tablelabel">
          <tr>
            <th>Name</th>
            <th>Speciality</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody>
          {trainers.length ? (
            trainers.map((trainer) => (
              <tr key={trainer._id}>
                <td className="train-name">{trainer.name}</td>
                <td>{trainer.speciality}</td>
                <td>{trainer.user?.email}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center' }}>
                No trainers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
// import './TrainT.css';

// export default function TrainT({ trainers }) {
//   return (
//     <div className="train-table">
//       <div className="train-table__header">
//         <h3 className="train-table__title">Trainers</h3>

        
//       </div>

//       <table className="train-table__table">
//         <thead className='train-tablelabel'>
//           <tr>
//             <th>Name</th>
//             <th>Subject</th>
//             <th>Contract</th>
//             <th>Sessions</th>
//             <th>Status</th>
//           </tr>
//         </thead>

//         <tbody>
//           {trainers.map((t) => (
//             <tr key={t.id}>
//               <td className="train-name">{t.name}</td>

//               <td>{t.subject}</td>

//               <td>{t.contract}</td>

//               <td>
//                 <span className="session-pill">
//                   {t.sessions}
//                 </span>
//               </td>

//               <td>
//                 <span
//                   className={`status-badge status-badge--${t.status.toLowerCase()}`}
//                 >
//                   <span className="status-dot" />
//                   {t.status}
//                 </span>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }