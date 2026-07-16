import "./UpcomingSchedule.css";

export default function UpcomingSchedule({
  schedule = [],
  onViewAll,
}) {
  const rows = schedule
    .map((item) => ({
      id: item._id,
      course: item.course?.courseCode || "-",
      session: `${new Date(item.session?.startDate).toLocaleDateString()} - ${new Date(
        item.session?.endDate
      ).toLocaleDateString()}`,
      date: new Date(item.date).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: `${item.startTime} - ${item.endTime}`,
      room: item.roomNo || "-",
      topic: item.topic || "-",
      status: item.status || "-",
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="upcoming-Schedulle">
      <div className="upcoming-Schedulle__header">
        <h3 className="upcoming-Schedulle__title">
          Upcoming Schedule
        </h3>

        {/* <button
          className="upcoming-Schedulle__view-all"
          onClick={onViewAll}
        >
          View all
        </button> */}
      </div>

      <table className="upcoming-Schedulle__table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Session</th>
            <th>Date</th>
            <th>Time</th>
            <th>Room</th>
            <th>Topic</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.id}>
                <td>{row.course}</td>
                <td>{row.session}</td>
                <td>{row.date}</td>
                <td>{row.time}</td>
                <td>{row.room}</td>
                <td>{row.topic}</td>
                <td>{row.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                No upcoming schedule
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}