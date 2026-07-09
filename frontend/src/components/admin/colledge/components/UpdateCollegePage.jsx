import "./UpdateCollegePage.css";
import { useDashboard } from "../../../../hooks/useDashboard";
import { useEffect, useState } from "react";

export default function UpdateCollegePage({
    token,
    onBack,
    college,
    updateCollege,
    AllModerators = [],
}) {

    const [formData, setFormData] = useState({
        name: "",
        pointOfContact: "",
        location: "",
        moderatorId: "",
    });

    const [loading, setLoading] = useState(false);


    //   useEffect(() => {
    //     if (college) {
    //       setFormData({
    //         name: college.name || "",
    //         pointOfContact: college.pointOfContact || "",
    //         location: college.location || "",
    //         moderatorId:
    //           college.moderatorId?._id ||
    //           college.moderatorId ||
    //           "",
    //       });
    //     }
    //   }, [college]);

    // useEffect(() => {
    //     if (college) {
    //         setFormData({
    //             name: college.name || "",
    //             pointOfContact: college.pointOfContact || "",
    //             location: college.location || "",
    //             moderatorId:
    //                 college.moderatorId?._id || college.moderatorId || "",
    //         });
    //     }
    //     console.log("Selected College data:", formData);
    // }, [college]);
    
    
    
    
    
    
    
    useEffect(() => {
        if (college) {
            setFormData({
                name: college.name || "",
                pointOfContact: college.pointOfContact || "",
                location: college.location || "",
                moderatorId: college.moderatorId?._id || "",
            });
                console.log("Selected College data:", formData);
  }
}, [college]);



    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };


    const handleSubmit = async () => {

        if (!formData.name.trim()) {
            alert("College name is required.");
            return;
        }

        try {
            setLoading(true);

            await updateCollege(
                college._id,
                formData,
                token
            );

            alert("College updated successfully.");

            onBack();

        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="update-college-page">

            <button onClick={onBack}>
                ← Back
            </button>

            <h2>Update College</h2>


            <div className="college-form">


                <div className="form-group">
                    <label>College Name</label>

                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                            handleChange(
                                "name",
                                e.target.value
                            )
                        }
                    />
                </div>



                <div className="form-group">
                    <label>Point of Contact</label>

                    <input
                        type="text"
                        value={formData.pointOfContact}
                        onChange={(e) =>
                            handleChange(
                                "pointOfContact",
                                e.target.value
                            )
                        }
                    />
                </div>



                <div className="form-group">
                    <label>Location</label>

                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                            handleChange(
                                "location",
                                e.target.value
                            )
                        }
                    />
                </div>



                <div className="form-group">
                    <label>Moderator</label>

                    <select
                        value={formData.moderatorId}
                        onChange={(e) =>
                            handleChange(
                                "moderatorId",
                                e.target.value
                            )
                        }
                    >

                        {/* <option value="">
              Select Moderator
            </option> */}


                        {AllModerators.map((moderator) => (
                            //   <option
                            //     key={moderator._id}
                            //     value={
                            //       moderator.userId ||
                            //       moderator._id
                            //     }
                            //   >
                            //     {moderator.name}
                            //   </option>
<option
  key={moderator._id}
  value={moderator.userId?._id || moderator.userId}
>
  {moderator.name}
</option>
                        ))}

                    </select>

                </div>



                <button
                    className="save-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {
                        loading
                            ? "Updating..."
                            : "Update College"
                    }
                </button>


            </div>

        </div>
    );
}