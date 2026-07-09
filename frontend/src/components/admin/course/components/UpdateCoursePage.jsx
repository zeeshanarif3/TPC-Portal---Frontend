import "./UpdateCoursePage.css";
import { useDashboard } from "../../../../hooks/useDashboard";
import { useEffect, useState } from "react";


export default function UpdateCoursePage({
  token,
  onBack,
  course,
  AllColleges = [],
  updateCourse,
}) {




  const [formData,setFormData] = useState({
    collegeId:"",
    courseCode:"",
  });



  const [loading,setLoading] = useState(false);




  useEffect(()=>{

    if(course){

      setFormData({

        collegeId:
          course.collegeId?._id ||
          course.collegeId ||
          "",


        courseCode:
          course.courseCode || "",

      });

    }

  },[course]);





  const handleChange=(field,value)=>{

    setFormData(prev=>({
      ...prev,
      [field]:value
    }));

  };





  const handleSubmit=async()=>{


    if(!course?._id){

      alert("Course data missing");
      return;

    }



    if(!formData.courseCode.trim()){

      alert("Course code is required");
      return;

    }




    try{


      setLoading(true);


      await updateCourse(
        course._id,
        formData,
        token
      );


      alert("Course updated successfully");


      onBack();



    }catch(err){

      alert(err.message);

    }
    finally{

      setLoading(false);

    }


  };





  return (

    <div className="update-course-page">


      <button onClick={onBack}>
        ← Back
      </button>



      <h2>
        Update Course
      </h2>




      <div className="course-form">



        <div className="form-group">

          <label>
            College
          </label>


          <select

            value={formData.collegeId}

            onChange={(e)=>
              handleChange(
                "collegeId",
                e.target.value
              )
            }

          >

            <option value="">
              Select College
            </option>


            {
              AllColleges.map(college=>(

                <option
                  key={college._id}
                  value={college._id}
                >

                  {college.name}

                </option>

              ))
            }


          </select>


        </div>





        <div className="form-group">

          <label>
            Course Code
          </label>



          <input

            type="text"

            placeholder="Enter course code"

            value={formData.courseCode}

            onChange={(e)=>
              handleChange(
                "courseCode",
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
            : "Update Course"
          }


        </button>



      </div>


    </div>

  );

}