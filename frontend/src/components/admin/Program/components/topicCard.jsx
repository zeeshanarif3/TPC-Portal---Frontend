import { useDashboard } from "../../../../hooks/useDashboard";
import "./topicCard.css";

export default function TopicCard({
    token,
    selectedSession,
    setSelectedSession,
}) {
    const {
        AllSessions = [],
        AllSlots = [],
        AllTrainers = [],
        AllContentSkeletons = [],
    } = useDashboard(token);
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



    const selectedSessionData = AllSessions.find(
        (session) => session._id === selectedSession
    );

    const sessionSlots = AllSlots.filter(
        (slot) => slot.sessionId?._id === selectedSession
    );


    const sessionContent = selectedSessionData
        ? AllContentSkeletons
            .filter((content) => {
                const scheduledDate = new Date(
                    content.timeline?.scheduledDate
                );

                const sessionStart = new Date(
                    selectedSessionData.startDate
                );

                const sessionEnd = new Date(
                    selectedSessionData.endDate
                );

                // Invalid dates should not be included
                if (
                    isNaN(scheduledDate.getTime()) ||
                    isNaN(sessionStart.getTime()) ||
                    isNaN(sessionEnd.getTime())
                ) {
                    return false;
                }

                return (
                    scheduledDate >= sessionStart &&
                    scheduledDate <= sessionEnd
                );
            })
            .sort((a, b) => {
                return (
                    new Date(a.timeline.scheduledDate) -
                    new Date(b.timeline.scheduledDate)
                );
            })
        : [];
    return (
<div className="contentTimelineCard">

    <div className="contentTimelineHeader">
        <div>
            <span className="contentTimelineTitle">
                CONTENT TIMELINE
            </span>

            <span className="contentTimelineSubtitle">
                Topics scheduled during this session
            </span>
        </div>

        <div className="contentTimelineCount">
            {sessionContent.length}
        </div>
    </div>

    {!selectedSessionData ? (
        <div className="contentTimelineEmpty">
            Please select a session
        </div>
    ) : sessionContent.length === 0 ? (
        <div className="contentTimelineEmpty">
            No topics scheduled for this session
        </div>
    ) : (
        <div className="contentTimelineList">

            {sessionContent.map((content) => (
                <div
                    className="contentTimelineItem"
                    key={content._id}
                >

                    {/* Timeline */}

                    <div className="contentTimelineMarker">
                        <div className="contentTimelineDot" />
                    </div>

                    {/* Content */}

                    <div className="contentTimelineContent">

                        <div className="contentTimelineDate">
                            {formatDate(
                                content.timeline?.scheduledDate
                            )}
                        </div>

                        <div className="contentTimelineTopic">
                            {content.metadata?.topic ||
                                content.title ||
                                "Untitled topic"}
                        </div>

                        {content.metadata?.description && (
                            <div className="contentTimelineDescription">
                                {content.metadata.description}
                            </div>
                        )}

                        <div className="contentTimelineMeta">

                            {content.metadata?.durationMinutes != null && (
                                <span>
                                    {content.metadata.durationMinutes} min
                                </span>
                            )}

                            {content.status && (
                                <span>
                                    {content.status}
                                </span>
                            )}

                            {content.metadata?.tags?.length > 0 && (
                                <span>
                                    {content.metadata.tags.join(", ")}
                                </span>
                            )}

                        </div>

                    </div>

                </div>
            ))}

        </div>
    )}

</div>    
);
}



