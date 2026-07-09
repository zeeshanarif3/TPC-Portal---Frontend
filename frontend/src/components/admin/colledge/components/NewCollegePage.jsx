import "./NewCollegePage.css";
import { useDashboard } from "../../../../hooks/useDashboard";
import { useState } from "react";

export default function NewCollegePage({ token, onBack ,createCollege , createModerator}) {


  const [formData, setFormData] = useState({
    // College
    collegeName: "",
    pointOfContact: "",
    location: "",

    // Moderator
    moderatorName: "",
    moderatorEmail: "",
    moderatorPassword: "",
    moderatorSpeciality: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.collegeName.trim()) {
      return alert("College name is required.");
    }

    if (!formData.moderatorName.trim()) {
      return alert("Moderator name is required.");
    }

    if (!formData.moderatorEmail.trim()) {
      return alert("Moderator email is required.");
    }

    if (!formData.moderatorPassword.trim()) {
      return alert("Moderator password is required.");
    }

    try {
      setLoading(true);

      // Step 1: Create moderator
      const moderatorRes = await createModerator(
        {
          name: formData.moderatorName,
          email: formData.moderatorEmail,
          password: formData.moderatorPassword,
          speciality: formData.moderatorSpeciality,
        },
        token
      );

      // Backend needs User._id
      const moderatorId = moderatorRes.user._id;

      // Step 2: Create college
      await createCollege(
        {
          name: formData.collegeName,
          pointOfContact: formData.pointOfContact,
          location: formData.location,
          moderatorId,
        },
        token
      );

      alert("College and Moderator created successfully.");
      onBack();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-college-page">
      <button onClick={onBack}>← Back</button>

      <h2>Create College</h2>

      <div className="college-form">

        <h3>College Details</h3>

        <div className="form-group">
          <label>College Name</label>
          <input
            type="text"
            placeholder="Enter college name"
            value={formData.collegeName}
            onChange={(e) =>
              handleChange("collegeName", e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Point of Contact</label>
          <input
            type="text"
            placeholder="Enter point of contact"
            value={formData.pointOfContact}
            onChange={(e) =>
              handleChange("pointOfContact", e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            placeholder="Enter location"
            value={formData.location}
            onChange={(e) =>
              handleChange("location", e.target.value)
            }
          />
        </div>

        <hr />

        <h3>Moderator Details</h3>

        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            placeholder="Moderator name"
            value={formData.moderatorName}
            onChange={(e) =>
              handleChange("moderatorName", e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Moderator email"
            value={formData.moderatorEmail}
            onChange={(e) =>
              handleChange("moderatorEmail", e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Moderator password"
            value={formData.moderatorPassword}
            onChange={(e) =>
              handleChange("moderatorPassword", e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Speciality</label>
          <input
            type="text"
            placeholder="Moderator speciality"
            value={formData.moderatorSpeciality}
            onChange={(e) =>
              handleChange("moderatorSpeciality", e.target.value)
            }
          />
        </div>

        <button
          className="save-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create College & Moderator"}
        </button>

      </div>
    </div>
  );
}


// import "./NewCollegePage.css";
// import { useDashboard } from "../../../../hooks/useDashboard";
// import { useState } from "react";

// export default function NewCollegePage({ token, onBack }) {
//   const {
//     createCollege,
//     AllModerators = [],
//   } = useDashboard();

//   const [formData, setFormData] = useState({
//     name: "",
//     pointOfContact: "",
//     location: "",
//     moderatorId: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleSubmit = async () => {
//     if (!formData.name.trim()) {
//       alert("College name is required.");
//       return;
//     }

//     if (!formData.moderatorId) {
//       alert("Please select a moderator.");
//       return;
//     }

//     try {
//       setLoading(true);

//       await createCollege(formData, token);

//       alert("College created successfully.");

//       onBack();
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="new-college-page">
//       <button onClick={onBack}>← Back</button>

//       <h2>Create College</h2>

//       <div className="college-form">
//         <div className="form-group">
//           <label>College Name</label>

//           <input
//             type="text"
//             placeholder="Enter college name"
//             value={formData.name}
//             onChange={(e) => handleChange("name", e.target.value)}
//           />
//         </div>

//         <div className="form-group">
//           <label>Point of Contact</label>

//           <input
//             type="text"
//             placeholder="Enter point of contact"
//             value={formData.pointOfContact}
//             onChange={(e) =>
//               handleChange("pointOfContact", e.target.value)
//             }
//           />
//         </div>

//         <div className="form-group">
//           <label>Location</label>

//           <input
//             type="text"
//             placeholder="Enter location"
//             value={formData.location}
//             onChange={(e) => handleChange("location", e.target.value)}
//           />
//         </div>

//         <div className="form-group">
//           <label>Moderator</label>
//           <pre>{JSON.stringify(AllModerators, null, 2)}</pre>

//           <select
//             value={formData.moderatorId}
//             onChange={(e) =>
//               handleChange("moderatorId", e.target.value)
//             }
//           >
//             <option value="">Select Moderator</option>

//             {AllModerators.map((moderator) => (
//               <option
//                 key={moderator._id}
//                 value={moderator.userId}
//               >
//                 {moderator.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button
//           className="save-btn"
//           onClick={handleSubmit}
//           disabled={loading}
//         >
//           {loading ? "Creating..." : "Create College"}
//         </button>
//       </div>
//     </div>
//   );
// }