import React from "react";
import { IUserSchedule, IRoster } from "../../../shared/model/schedule.model";
import { useLocation } from "react-router-dom";
import BackButton from "../../../shared/layout/buttons/back-button";
import EditButton from "../../../shared/layout/buttons/edit-button";
import DeleteButton from "../../../shared/layout/buttons/delete-button";
import LabeledField from "../../../shared/layout/fields/labeled-field";
import { Avatar, Label } from "flowbite-react";
import { capitalizeString } from "../../../configs/utils";

const ViewSchedule = () => {
  const location = useLocation();
  const roster = location.state?.roster as IRoster[];
  const type = location.state?.type as string;
  const startDate = new Date(roster[0].start_date);
  console.log(roster)
  return (
    <div id="schedule-details-main">
      <p className="header">Schedule Details</p>
      <div className="md:mx-10 grid grid-cols-2 gap-4 md:w-1/2">
        <LabeledField
          id="schedule-date"
          labelValue="Date"
          value={startDate.toLocaleDateString()}
        />
        <LabeledField
          id="schedule-location"
          labelValue="Location"
          value= {roster[0].location?.name}
        />
        <div className="col-span-2">
          <Label htmlFor="schedule-employees" value="Scheduled Employees" />
          <div id="schedule-employees" className="grid grid-cols-2">
            {
            roster.map((rosteridx, idx) => (
              rosteridx.schedules?.map((schedule, scheduleIdx) => (
                <div key={scheduleIdx} className="flex mt-4">
                  <p>{capitalizeString(schedule.user?.fullname)}</p>
                  <p>{capitalizeString(schedule.user?.position)}</p>
                  <p>{schedule.shift} Shift</p>
                  <p>{schedule.user?.contact_no}</p>
                </div>
              ))
            ))
            }
            {/* {schedule.employeesSelected.map((employee, idx) => (
              <div key={idx} className="flex mt-4">
                <Avatar size="sm" img={employee.profileImage} rounded>
                  <p>{capitalizeString(employee.name)}</p>
                  <p>{capitalizeString(employee.position)}</p>
                  <p>{employee.shift} Shift</p>
                  <p>{employee.phoneNo}</p>
                </Avatar>
              </div>
            ))} */}
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
