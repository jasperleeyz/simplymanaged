import React from "react";
import { useEffect } from "react";
import { IRoster } from "../../../shared/model/schedule.model";
import { PATHS } from "../../../configs/constants";
import { useLocation } from "react-router-dom";
import BackButton from "../../../shared/layout/buttons/back-button";
import EditButton from "../../../shared/layout/buttons/edit-button";
import DeleteButton from "../../../shared/layout/buttons/delete-button";
import LabeledField from "../../../shared/layout/fields/labeled-field";
import { Avatar, Label } from "flowbite-react";
import { capitalizeString } from "../../../configs/utils";
import { useNavigate } from "react-router-dom";
import { deleteRoster } from "../../../shared/api/roster.api";
import { toast } from "react-toastify";

const ViewSchedule = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roster = location.state?.roster as IRoster[];
  const type = location.state?.type as string;
  const date = new Date();
  const startDate = new Date(roster[0].start_date);
  const currentDate = new Date();
  const [rosterToDelete, setRosterToDelete] = React.useState<IRoster | null>(null);
  const [submitLoading, setSubmitLoading] = React.useState(false);
  useEffect(() => {
    if(submitLoading && rosterToDelete){
      deleteRoster(rosterToDelete).finally(() => {
        toast.success("Roster delete successfully");
        navigate(`/${PATHS.SCHEDULE}`, { replace: true });
        setRosterToDelete(null)
      })
    }
  }, [submitLoading]);

  return (
    <div id="schedule-details-main">
      <p className="header">Schedule Details</p>
      <div>
        <LabeledField
          id="schedule-date"
          labelValue="Date"
          value={startDate.toLocaleDateString()}
        />
        <div>
          <Label htmlFor="schedule-employees" value="Scheduled Employees" />
          <div id="schedule-employees">
            {roster.map((rosteridx, idx) => (
              <div className = "mt-2">
                <p>Created by: {rosteridx.created_by}</p>
              <div className="border border-solid border-black p-2 mt-2">
                <p>{rosteridx.type}</p>
                <div key={idx} className=" grid grid-cols-5 gap-4">
                  {rosteridx.schedules?.map((schedule, scheduleIdx) => (
                    <div key={scheduleIdx}>
                      <p>{capitalizeString(schedule.user?.fullname)}</p>
                      <p>{capitalizeString(schedule.user?.position)}</p>
                      <p>{schedule.shift} Shift</p>
                      <p>{schedule.user?.contact_no}</p>
                    </div>
                  ))}
                </div>
                {startDate > currentDate && (
                  <div className="mt-4 flex" style={{ justifyContent: "flex-end" }}>
                  <EditButton size="sm" style={{ marginRight: "10px" }} onClick={() => {
                    navigate(`/${PATHS.SCHEDULE}/${PATHS.EDIT_SCHEDULE}`, {
                      state: { rosteridx },
                      replace: true
                    });
                  }}/>
                  <DeleteButton size="sm"
                  onClick={() => {
                    setRosterToDelete(rosteridx);
                    setSubmitLoading(true);
                    }} />
                </div>
                )}
              </div>
              </div>
            ))}
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
        {/*
        <div className="mt-4 col-span-2">
          <div className="flex gap-4">
            <BackButton size="sm" />
            <EditButton size="sm" />
            <DeleteButton size="sm" />
          </div>
        </div>
*/}
      </div>
    </div>
  );
};

export default ViewSchedule;
