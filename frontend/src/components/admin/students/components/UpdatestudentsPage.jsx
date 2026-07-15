import "./UpdateTrainerPage.css";
import { useDashboard } from "../../../../hooks/useDashboard";
import { useEffect, useState } from "react";
import './UpdateTrainerPage.css'
export default function UpdateTrainerPage({
  token,
  onBack,
  trainer,
  updateTrainer,
}) {



  const [formData, setFormData] = useState({
    name: "",
    speciality: "",
  });


  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (trainer) {
      setFormData({
        name: trainer.name || "",
        speciality: trainer.speciality || "",
      });
    }
  }, [trainer]);



  const handleChange = (field, value) => {
    setFormData((prev)=>({
      ...prev,
      [field]: value,
    }));
  };



  const handleSubmit = async () => {

    if (!trainer?._id) {
      alert("Trainer data missing.");
      return;
    }


    if (!formData.name.trim()) {
      alert("Trainer name is required.");
      return;
    }


    try {

      setLoading(true);


      await updateTrainer(
        trainer._id,
        formData,
        token
      );


      alert("Trainer updated successfully.");

      onBack();


    } catch(err) {

      alert(err.message);

    } finally {

      setLoading(false);

    }
  };



  return (
    <div className="update-trainer-page">

      <button onClick={onBack}>
        ← Back
      </button>


      <h2>
        Update Trainer
      </h2>



      <div className="trainer-form">


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
            : "Update Trainer"
          }

        </button>


      </div>

    </div>
  );
}