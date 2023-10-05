import moment from "moment";
import { useNavigate } from "react-router-dom";
import { IUserSchedule } from "../../model/schedule.model";
import React from "react";
import { GlobalStateContext } from "../../../configs/global-state-provider";

type IProps = {
  date?: moment.Moment;
  schedule?: IUserSchedule | null;
};

const PersonalDateBox = ({
  date = moment(new Date()),
  schedule = null,
}: IProps) => {
  const navigate = useNavigate();
  const user = React.useContext(GlobalStateContext).globalState?.user;

  // const userInSchedule = schedule?.employeesSelected.find((emp) => {
  //     if (emp.id === user?.id) return emp;
  //     return null;
  //   });
  const userInSchedule = {} as any;

  return (
    <div className="w-[110px] h-[110px] max-w-sm max-h-sm group">
      <p>{date.date()}</p>
      <br />
      {!userInSchedule && (
        <div className="relative">
          <p className="absolute whitespace-normal">No schedule for the day</p>
        </div>
      )}
      {userInSchedule && (
        <div className="relative">
          {/* <p className="absolute whitespace-normal">No schedule for the day</p>
        <Button size="sm" className='absolute hidden group-hover:block' color="info">Add schedule</Button> */}
          <div className="bg-green-300 rounded p-1">
            <p>{schedule?.shift}</p> {/* TODO: change to location */}
            <p>{userInSchedule?.shift + " Shift"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalDateBox;
