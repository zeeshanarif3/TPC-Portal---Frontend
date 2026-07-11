import "./UpdateContractPage.css";
import { useDashboard } from "../../../../hooks/useDashboard";
import { useEffect, useState } from "react";

import './UpdateContractPage.css'
export default function UpdateContractPage({
  token,
  onBack,
  contract,
  AllTrainers = [],
  AllSessions = [],
  updateContract,
}) {


  const [formData, setFormData] = useState({
    trainerId: "",
    sessionId: "",
    startDate: "",
    endDate: "",
    status: "active",
  });


  const [loading, setLoading] = useState(false);



  useEffect(() => {

    if(contract){

      setFormData({

        trainerId:
          contract.trainerId?._id ||
          contract.trainerId ||
          "",


        sessionId:
          contract.sessionId?._id ||
          contract.sessionId ||
          "",


        startDate:
          contract.startDate
          ? contract.startDate.split("T")[0]
          : "",


        endDate:
          contract.endDate
          ? contract.endDate.split("T")[0]
          : "",


        status:
          contract.status || "active",

      });

    }

  },[contract]);



  const handleChange=(field,value)=>{

    setFormData(prev=>({
      ...prev,
      [field]:value
    }));

  };



  const handleSubmit=async()=>{


    if(!contract?._id){

      alert("Contract data missing");
      return;

    }


    try{

      setLoading(true);


      await updateContract(
        contract._id,
        formData,
        token
      );


      alert("Contract updated successfully");

      onBack();


    }catch(err){

      alert(err.message);

    }
    finally{

      setLoading(false);

    }

  };




  return (

    <div className="update-contract-page">


      <button onClick={onBack}>
        ← Back
      </button>


      <h2>
        Update Contract
      </h2>



      <div className="contract-form">



        <div className="form-group">

          <label>
            Trainer
          </label>


          <select
            value={formData.trainerId}
            onChange={(e)=>
              handleChange(
                "trainerId",
                e.target.value
              )
            }
          >

            <option value="">
              Select Trainer
            </option>


            {
              AllTrainers.map((trainer)=>(

                <option
                  key={trainer._id}
                  value={trainer._id}
                >

                  {trainer.name}

                </option>

              ))
            }


          </select>


        </div>




        <div className="form-group">

          <label>
            Session
          </label>


          <select
            value={formData.sessionId}
            onChange={(e)=>
              handleChange(
                "sessionId",
                e.target.value
              )
            }
          >

            <option value="">
              Select Session
            </option>


            {
              AllSessions.map((session)=>(

                <option
                  key={session._id}
                  value={session._id}
                >

                  {
                    session.collegeId?.name
                  }
                  {" - "}
                  {
                    new Date(
                      session.startDate
                    ).toLocaleDateString()
                  }

                </option>

              ))
            }


          </select>


        </div>




        <div className="form-group">

          <label>
            Start Date
          </label>


          <input
            type="date"
            value={formData.startDate}
            onChange={(e)=>
              handleChange(
                "startDate",
                e.target.value
              )
            }
          />

        </div>




        <div className="form-group">

          <label>
            End Date
          </label>


          <input
            type="date"
            value={formData.endDate}
            onChange={(e)=>
              handleChange(
                "endDate",
                e.target.value
              )
            }
          />

        </div>




        <div className="form-group">

          <label>
            Status
          </label>


          <select
            value={formData.status}
            onChange={(e)=>
              handleChange(
                "status",
                e.target.value
              )
            }
          >

            <option value="active">
              Active
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>


          </select>


        </div>




        <button
          className="save-btn"
          disabled={loading}
          onClick={handleSubmit}
        >

          {
            loading
            ? "Updating..."
            : "Update Contract"
          }


        </button>



      </div>


    </div>

  );

}