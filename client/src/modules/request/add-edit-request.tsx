import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LeaveForm from "./leave-form";

const AddOrEditRequest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const type = query.get("type");
  const isEdit = location.pathname.includes("edit");

  return (
    (type && type === "leave") ? (<LeaveForm />) 
    : (type && type === "shift") ? (<></>) 
    : type && type === "swap" ? (<></>) 
    : null
  );
};

export default AddOrEditRequest;
