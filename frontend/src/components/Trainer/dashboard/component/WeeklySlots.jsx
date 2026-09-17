import { useMemo } from "react";
import { Check, Clock3, X } from "lucide-react";
import "./WeeklySlots.css";


function getWeekRange(date = new Date()) {
    const current = new Date(date);

    // Monday = first day of week
    const day = current.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    const monday = new Date(current);
    monday.setDate(current.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
}


function formatRange(monday, sunday) {
    const start = monday.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
    });

    const end = sunday.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return `${start} – ${end}`;
}


function formatDay(date) {
    return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
    });
}


function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getSlotDate(slot) {
    const date = new Date(slot.date);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}


function formatStatus(status) {
    if (status === "completed") return "Completed";
    if (status === "cancelled") return "Cancelled";
    return "Scheduled";
}


export default function WeeklySlots({ slots = [] }) {

    const weekData = useMemo(() => {
        const { monday, sunday } = getWeekRange();

        const weekSlots = slots
            .map((slot) => ({
                ...slot,
                parsedDate: getSlotDate(slot),
            }))
            .filter((slot) => {
                if (!slot.parsedDate) return false;

                return (
                    slot.parsedDate >= monday &&
                    slot.parsedDate <= sunday
                );
            })
            .sort((a, b) => {
                const dateA = a.parsedDate;
                const dateB = b.parsedDate;

                const dateCompare =
                    dateA.getTime() - dateB.getTime();

                if (dateCompare !== 0) {
                    return dateCompare;
                }

                return (a.startTime || "").localeCompare(
                    b.startTime || ""
                );
            });

        const days = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);

            const key = getDateKey(date);

            days.push({
                date,
                key,
                slots: weekSlots.filter(
                    (slot) =>
                        getDateKey(slot.parsedDate) === key
                ),
            });
        }

        return {
            monday,
            sunday,
            days,
            weekSlots,
        };
    }, [slots]);


    const completedCount =
        weekData.weekSlots.filter(
            (slot) => slot.status === "completed"
        ).length;


    const scheduledCount =
        weekData.weekSlots.filter(
            (slot) => slot.status === "scheduled"
        ).length;


    return (
        <section className="weeklySlots">

            <div className="weeklySlotsHeader">

                <div>
                    <h2>Slots this Week </h2>

                    <p>
                        {formatRange(
                            weekData.monday,
                            weekData.sunday
                        )}
                    </p>
                </div>

                <div className="weeklySlotsSummary">

                    <span>
                        {weekData.weekSlots.length}{" "}
                        {weekData.weekSlots.length === 1
                            ? "slot"
                            : "slots"}
                    </span>

                    <span className="summaryDot">
                        •
                    </span>

                    <span>
                        {completedCount} completed
                    </span>

                </div>

            </div>


            <div className="weeklySlotsBody">

                {weekData.days.map((day) => (

                    <div
                        className="weeklyDay"
                        key={day.key}
                    >

                        <div className="weeklyDayHeader">

                            <span className="weeklyDayName">
                                {formatDay(day.date)}
                            </span>

                            {day.slots.length > 0 && (
                                <span className="weeklyDayCount">
                                    {day.slots.length}
                                </span>
                            )}

                        </div>


                        <div className="weeklyDaySlots">

                            {day.slots.length === 0 ? (

                                <div className="weeklyNoSlots">
                                    No classes
                                </div>

                            ) : (

                                day.slots.map((slot) => {

                                    const status =
                                        slot.status ||
                                        "scheduled";

                                    return (
                                        <article
                                            className={`weeklySlot weeklySlot-${status}`}
                                            key={slot._id}
                                        >

                                            <div className="weeklySlotTime">

                                                <strong>
                                                    {slot.startTime ||
                                                        "--:--"}
                                                </strong>

                                                <span>
                                                    {slot.endTime ||
                                                        "--:--"}
                                                </span>

                                            </div>


                                            <div className="weeklySlotContent">

                                                <div className="weeklySlotTop">

                                                    <h3>
                                                        {slot.topic ||
                                                            "Untitled class"}
                                                    </h3>

                                                    <span
                                                        className={`weeklySlotStatus status-${status}`}
                                                    >
                                                        {status ===
                                                            "completed" && (
                                                            <Check size={13} />
                                                        )}

                                                        {status ===
                                                            "scheduled" && (
                                                            <Clock3 size={13} />
                                                        )}

                                                        {status ===
                                                            "cancelled" && (
                                                            <X size={13} />
                                                        )}

                                                        {formatStatus(
                                                            status
                                                        )}
                                                    </span>

                                                </div>


                                                <div className="weeklySlotMeta">

                                                    <span>
                                                        {slot.course
                                                            ?.courseCode ||
                                                            "Course"}
                                                    </span>

                                                    {slot.roomNo && (
                                                        <>
                                                            <span>
                                                                •
                                                            </span>

                                                            <span>
                                                                Room{" "}
                                                                {
                                                                    slot.roomNo
                                                                }
                                                            </span>
                                                        </>
                                                    )}

                                                </div>

                                            </div>

                                        </article>
                                    );
                                })

                            )}

                        </div>

                    </div>

                ))}

            </div>


            <div className="weeklySlotsFooter">

                <div className="weeklyLegendItem">
                    <span className="legendDot completed" />
                    Completed
                </div>

                <div className="weeklyLegendItem">
                    <span className="legendDot scheduled" />
                    Scheduled
                </div>

                <div className="weeklyLegendItem">
                    <span className="legendDot cancelled" />
                    Cancelled
                </div>

            </div>

        </section>
    );
}