import { useLocation } from "react-router-dom";
import BackButton from "../../../shared/layout/buttons/back-button";
import { Button, Label, TextInput } from "flowbite-react";
import { HiUserGroup } from "react-icons/hi";
import React from "react";
import moment from "moment";

type ScheduleDetails = {
  date?: Date;
  scheduleTemplate?: string;
};

const AddSchedule = () => {
  const location = useLocation();
  const date: Date = location.state?.date;

  const [scheduleDetailsState, setScheduleDetailsState] =
    React.useState<ScheduleDetails>({
      date: date || new Date(),
    });

  return (
    <div>
      <p className="header">Create Schedule</p>
      <div className="mb-3 flex justify-between">
        <BackButton size="sm" />
        <Button color="success" size="sm">
          <p>Auto Assign Personnel</p>
          <HiUserGroup className="ml-2 my-auto" />
        </Button>
      </div>
      <form>
        <Label htmlFor="schedule-date" value="Date"/>
        <TextInput
          id="schedule-date"
          type="date"
          value={moment(scheduleDetailsState.date).format("yyyy-MM-DD")}
          onChange={(e) =>
            setScheduleDetailsState((prev) => ({
              ...prev,
              date: new Date(e.target.value),
            }))
          }
        />
      </form>
    </div>
  );
};

export default AddSchedule;
