import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../shared/layout/buttons/back-button";
import LabeledField from "../../shared/layout/fields/labeled-field";
import { IUserSchedule } from "../../shared/model/schedule.model";
import { getLocationById } from "../../shared/api/location.api";
import { ICompanyLocation } from "../../shared/model/company.model";

const ViewPersonalSchedule = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [schedule, setSchedule] = React.useState<IUserSchedule>(
    location.state?.schedule
  );
  const [scheduleLocation, setScheduleLocation] =
    React.useState<ICompanyLocation>();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    console.log( schedule.user_company_id)
    console.log( schedule.roster?.location_id)
    setLoading((prev) => true);
    getLocationById(
      schedule.user_company_id || 0,
      schedule.roster?.location_id || 0
    )
      .then((res) => {
        console.log(res.data)
        setScheduleLocation(res.data);
      })
      .finally(() => {
        setLoading((prev) => false);
      });
  }, []);
  return (
    <div>
      {!loading ? (
        <div id="personal-schedule-main">
          <p className="header">Schedule Details</p>
          <div className="md:mx-10">
            <div className="grid gap-3 grid-cols-3">
              <LabeledField
                id="start-date"
                labelValue="Start Date"
                value={new Date(schedule.start_date).toLocaleDateString()}
              />
              <LabeledField
                id="end-date"
                labelValue="End Date"
                value={new Date(schedule.end_date).toLocaleDateString()}
              />
            </div>
            <div className="grid gap-3 grid-cols-3">
              <LabeledField
                id="location"
                labelValue="Location"
                value={scheduleLocation?.name}
              />
              <LabeledField
                id="address"
                labelValue="Address"
                value={scheduleLocation?.address}
              />
            </div>
            <div className="grid gap-3 grid-cols-3">
              <LabeledField
                id="shift"
                labelValue="Shift"
                value={schedule.shift}
              />
              <LabeledField
                id="roster-type"
                labelValue="Type"
                value={schedule.roster?.type}
              />
            </div>
          </div>
          <div className="flex mt-8 gap-3">
            <BackButton size="sm" />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ViewPersonalSchedule;
