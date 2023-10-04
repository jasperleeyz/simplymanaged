import React from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../../../configs/constants";
import BackButton from "../../../shared/layout/buttons/back-button";
import { toast } from "react-toastify";

const RegistrationDetails = () => {
  const id = useParams()?.id;

  React.useEffect(() => {
    fetch(`${API_URL}/registration/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (res.status === 404) {
          toast.error("Registration info not found");
        }
        res.json().then((data) => {
          console.log(data);
        });
      })
      .catch((err) => {
        toast.error("Error fetching registration details");
      });
  }, []);

  return (
    <div id="registration-details">
      <p className="header">Registration Details</p>
      <BackButton size="sm" />
    </div>
  );
};

export default RegistrationDetails;
