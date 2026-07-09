import "./NewModeratorPage.css";
import { useDashboard } from "../../../../hooks/useDashboard";
import { useState } from "react";

export default function NewModeratorPage({ token, onBack }) {
  const { createModerator } = useDashboard();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    speciality: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Moderator name is required.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Email is required.");
      return;
    }

    if (!formData.password.trim()) {
      alert("Password is required.");
      return;
    }

    try {
      setLoading(true);

      await createModerator(formData, token);

      alert("Moderator created successfully.");

      onBack();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-moderator-page">
      <button onClick={onBack}>← Back</button>

      <h2>Create Moderator</h2>

      <div className="moderator-form">
        <div className="form-group">
          <label>Name</label>

          <input
            type="text"
            placeholder="Enter moderator name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Speciality</label>

          <input
            type="text"
            placeholder="Enter speciality"
            value={formData.speciality}
            onChange={(e) => handleChange("speciality", e.target.value)}
          />
        </div>

        <button
          className="save-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Moderator"}
        </button>
      </div>
    </div>
  );
}