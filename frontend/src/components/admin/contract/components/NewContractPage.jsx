import "./NewContractPage.css";
import { useDashboard } from "../../../../hooks/useDashboard";
import { useState } from "react";

export default function NewContractPage({ token, onBack, AllTrainers, AllSessions ,createContract}) {
  const [formData, setFormData] = useState({
    trainerId: "",
    sessionId: "",
    startDate: "",
    endDate: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.trainerId) {
      alert("Please select a trainer.");
      return;
    }

    if (!formData.sessionId) {
      alert("Please select a session.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        trainerId: formData.trainerId,
        sessionId: formData.sessionId,
        status: formData.status,
      };

      if (formData.startDate) {
        payload.startDate = formData.startDate;
      }

      if (formData.endDate) {
        payload.endDate = formData.endDate;
      }

      await createContract(payload, token);

      alert("Contract created successfully.");

      onBack();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-contract-page">
      <button onClick={onBack}>← Back</button>

      <h2>Create Contract</h2>

      <div className="contract-form">

        <div className="form-group">
          <label>Trainer</label>

          <select
            value={formData.trainerId}
            onChange={(e) =>
              handleChange("trainerId", e.target.value)
            }
          >
            <option value="">Select Trainer</option>

            {AllTrainers.map((trainer) => (
              <option key={trainer._id} value={trainer._id}>
                {trainer.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Session</label>

          <select
            value={formData.sessionId}
            onChange={(e) =>
              handleChange("sessionId", e.target.value)
            }
          >
            <option value="">Select Session</option>
            {AllSessions.map((session) => (
              <option
                key={session._id}
                value={session._id}
              >
                {`${session.collegeId?.name} | ${new Date(
                  session.startDate
                ).toLocaleDateString()} - ${new Date(
                  session.endDate
                ).toLocaleDateString()}`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Start Date (Optional)</label>

          <input
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              handleChange("startDate", e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>End Date (Optional)</label>

          <input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              handleChange("endDate", e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Status</label>

          <select
            value={formData.status}
            onChange={(e) =>
              handleChange("status", e.target.value)
            }
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button
          className="save-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Contract"}
        </button>

      </div>
    </div>
  );
}