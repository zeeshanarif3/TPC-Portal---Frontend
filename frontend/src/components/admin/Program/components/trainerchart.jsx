import { useDashboard } from "../../../../hooks/useDashboard";

import "./trainerChart.css";

export default function TrainerChart({
    token,
    selectedSession
}) {
      const {
          AllTrainers = [],
          AllSlots = [],

      } = useDashboard(token);
    const sessionSlots = AllSlots.filter(
        (slot) => slot.sessionId?._id === selectedSession
    );


const trainerHours = AllTrainers.map((trainer) => {
    // Get all slots for this trainer in the selected session
    const trainerSlots = sessionSlots.filter(
        (slot) => slot.trainerId === trainer._id
    );

    // Completed slots
    const completedSlots = trainerSlots.filter(
        (slot) => slot.status === "completed"
    );

    // Cancelled slots
    const cancelledSlots = trainerSlots.filter(
        (slot) => slot.status === "cancelled"
    );

    // Slots that are actually part of the active schedule
    const activeSlots = trainerSlots.filter(
        (slot) => slot.status !== "cancelled"
    );

    return {
        id: trainer._id,
        name: trainer.name,
        speciality: trainer.speciality,

        totalHours: activeSlots.length,
        completedHours: completedSlots.length,
        cancelledHours: cancelledSlots.length,

        completionPercentage:
            activeSlots.length > 0
                ? Math.round(
                      (completedSlots.length / activeSlots.length) * 100
                  )
                : 0,
    };
}).filter((trainer) => trainer.totalHours > 0);
  return (
<div className="trainerHoursCard">
    <div className="trainerHoursHeader">
        <span>TRAINER HOURS</span>
    </div>

    <div className="trainerHoursList">

        {trainerHours.length === 0 ? (
            <div className="noTrainerHours">
                No trainer schedule available
            </div>
        ) : (
            trainerHours.map((trainer) => (
                <div
                    className="trainerHoursItem"
                    key={trainer.id}
                >

                    {/* Trainer information */}

                    <div className="trainerInfo">

                        <div className="trainerAvatar">
                            {trainer.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div className="trainerDetails">
                            <span className="trainerName">
                                {trainer.name}
                            </span>

                            <span className="trainerSpeciality">
                                {trainer.speciality || "—"}
                            </span>
                        </div>

                    </div>

                    {/* Hours */}

                    <div className="trainerHoursStats">

                        <div className="trainerHoursMain">
                            <strong>
                                {trainer.completedHours}
                            </strong>

                            <span>
                                / {trainer.totalHours} hrs
                            </span>
                        </div>

                        <span className="trainerHoursPercentage">
                            {trainer.completionPercentage}%
                        </span>

                    </div>

                    {/* Progress */}

                    <div className="trainerHoursProgress">
                        <div
                            className="trainerHoursProgressFill"
                            style={{
                                width: `${trainer.completionPercentage}%`,
                            }}
                        />
                    </div>

                    {/* Additional details */}

                    <div className="trainerHoursMeta">

                        <span>
                            {trainer.completedHours} completed
                        </span>

                        {trainer.totalHours -
                            trainer.completedHours >
                            0 && (
                            <span>
                                {trainer.totalHours -
                                    trainer.completedHours}{" "}
                                remaining
                            </span>
                        )}

                        {trainer.cancelledHours > 0 && (
                            <span>
                                {trainer.cancelledHours} cancelled
                            </span>
                        )}

                    </div>

                </div>
            ))
        )}

    </div>

</div>  
);
}
