import React from "react";
import { ScheduleDetails } from "../../../shared/model/schedule.model";
import { useLocation } from "react-router-dom";
import BackButton from "../../../shared/layout/buttons/back-button";
import EditButton from "../../../shared/layout/buttons/edit-button";
import DeleteButton from "../../../shared/layout/buttons/delete-button";
import LabeledField from "../../../shared/layout/fields/labeled-field";
import { Avatar, Label } from "flowbite-react";
import { capitalizeString } from "../../../configs/utils";

const ViewSchedule = () => {
  const location = useLocation();
  const schedule = location.state?.schedule as ScheduleDetails;
  const type = location.state?.type as string;

  return (
    <div id="schedule-details-main">
      <p className="header">Schedule Details</p>
      <div className="md:mx-10 grid grid-cols-2 gap-4 md:w-1/2">
        <LabeledField
          id="schedule-date"
          labelValue="Date"
          value={schedule.date?.toLocaleDateString()}
        />
        <LabeledField
          id="schedule-location"
          labelValue="Location"
          value={schedule.location}
        />
        <div className="col-span-2">
          <Label htmlFor="schedule-employees" value="Scheduled Employees" />
          <div id="schedule-employees" className="grid grid-cols-2">
            {schedule.employeesSelected.map((employee, idx) => (
              <div key={idx} className="flex mt-4">
                <Avatar size="sm" img={employee.profileImage} rounded>
                  <p>{capitalizeString(employee.name)}</p>
                  <p>{capitalizeString(employee.position)}</p>
                  <p>{employee.shift} Shift</p>
                  <p>{employee.phoneNo}</p>
                </Avatar>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 col-span-2">
          <div className="flex gap-4">
            <BackButton size="sm" />
            <EditButton size="sm" />
            <DeleteButton size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSchedule;
