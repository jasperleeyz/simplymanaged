import { useLocation } from "react-router-dom";
import BackButton from "../../../shared/layout/buttons/back-button";
import { Button } from "flowbite-react";
import { HiUserGroup } from "react-icons/hi";

const AddSchedule = () => {
  const location = useLocation();
  const date: Date = location.state?.date;

  return (
    <div>
      <p className="header">Create Schedule</p>
      <div className="mb-3 flex justify-between">
        <BackButton size="sm"/>
        <Button color="success" size="sm">
            <p>Auto Assign Personnel</p>
            <HiUserGroup className="ml-2 my-auto"/>
        </Button>
      </div>
      <div>{date.toLocaleDateString()}</div>
    </div>
  );
};

export default AddSchedule;
