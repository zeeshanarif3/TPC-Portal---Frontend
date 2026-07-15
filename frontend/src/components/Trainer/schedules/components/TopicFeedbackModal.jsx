import { useState } from "react";
// import { updateTopicAndFeedback } from "../../services/dashboardapi";

import "./TopicFeedbackModal.css";

export default function TopicFeedbackModal({

  slot,

  token,

  onBack,

  onSuccess,
  updateTopicAndFeedback,

}) {

  const [topic, setTopic] = useState(slot?.topic || "");

  const [feedback, setFeedback] = useState(slot?.feedback || "");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  async function handleSubmit(e) {

    e.preventDefault();

    setError("");

    setLoading(true);

    try {

      const updated = await updateTopicAndFeedback(

        slot._id,

        { topic, feedback },

        token

      );

      if (onSuccess) {

        onSuccess(updated);

      }

      onBack();

    }
    catch (err) {

      setError(err.message || "Failed to update topic and feedback");

    }
    finally {

      setLoading(false);

    }

  }


  if (!slot) return null;


  return (

    <div className="modal-overlay" onClick={onBack}>

      <div

        className="modal-content flat-card"

        onClick={(e) => e.stopPropagation()}

      >

        <h3>Edit Topic & Feedback</h3>

        <p className="modal-subtitle">

          {slot.courseId?.courseCode || "Slot"}
          {" · "}
          {slot.date
            ? new Date(slot.date).toLocaleDateString()
            : "-"}

        </p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>

          <label htmlFor="topic">Topic</label>

          <input

            id="topic"

            type="text"

            value={topic}

            onChange={(e) => setTopic(e.target.value)}

            placeholder="Enter topic"

            disabled={loading}

          />

          <label htmlFor="feedback">Feedback</label>

          <textarea

            id="feedback"

            rows={4}

            value={feedback}

            onChange={(e) => setFeedback(e.target.value)}

            placeholder="Enter feedback"

            disabled={loading}

          />

          <div className="modal-actions">

            <button

              type="button"

              className="btn-secondary"

              onClick={onBack}

              disabled={loading}

            >

              Cancel

            </button>

            <button

              type="submit"

              className="btn-primary"

              disabled={loading}

            >

              {loading ? "Saving..." : "Save"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}