import "./UpdateModeratorPage.css";
import { useDashboard } from "../../../../hooks/useDashboard";
import { useEffect, useState } from "react";

import './UpdateModeratorPage.css'

export default function UpdateModeratorPage({
  token,
  onBack,
  moderator,
  updateModerator,
}) {


  const [formData, setFormData] = useState({
    name: "",
    speciality: "",
  });


  const [loading, setLoading] = useState(false);



  useEffect(() => {
    if (moderator) {
      setFormData({
        name: moderator.name || "",
        speciality: moderator.speciality || "",
      });
    }
  }, [moderator]);



  const handleChange = (field, value) => {
    setFormData((prev)=>({
      ...prev,
      [field]: value,
    }));
  };



  const handleSubmit = async () => {

    if (!moderator?._id) {
      alert("Moderator data missing.");
      return;
    }


    if (!formData.name.trim()) {
      alert("Moderator name is required.");
      return;
    }


    try {

      setLoading(true);


      await updateModerator(
        moderator._id,
        formData,
        token
      );


      alert("Moderator updated successfully.");

      onBack();


    } catch(err) {

      alert(err.message);

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="update-moderator-page">


      <button onClick={onBack}>
        ← Back
      </button>



      <h2>
        Update Moderator
      </h2>



      <div className="moderator-form">



        <div className="form-group">

          <label>
            Name
          </label>


          <input
            type="text"
            value={formData.name}
            onChange={(e)=>
              handleChange(
                "name",
                e.target.value
              )
            }
          />

        </div>



        <div className="form-group">

          <label>
            Speciality
          </label>


          <input
            type="text"
            value={formData.speciality}
            onChange={(e)=>
              handleChange(
                "speciality",
                e.target.value
              )
            }
          />

        </div>



        <button
          className="save-btn"
          disabled={loading}
          onClick={handleSubmit}
        >

          {
            loading
            ? "Updating..."
            : "Update Moderator"
          }

        </button>


      </div>


    </div>

  );
}