import React from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../../../configs/constants";

const RegistrationDetails = () => {
  const id = useParams()?.id;

  React.useEffect(() => {
    fetch(`${API_URL}/registration/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }).then((res) => {
      res.json().then((data) => {
        console.log(data);
      });
    });
  }, []);

  return (
    <div id="registration-details">
      <p className="header">Registration Details</p>
    </div>
  );
};

export default RegistrationDetails;
