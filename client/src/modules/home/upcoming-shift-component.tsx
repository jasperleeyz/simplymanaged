import moment from 'moment'
import React from 'react'
import { IUserSchedule } from '../../shared/model/schedule.model'
import { GlobalStateContext } from '../../configs/global-state-provider'


interface IProps {
    schedule: IUserSchedule;
}

const UpcomingShiftComponent = ({ schedule }: IProps) => {
  const company = React.useContext(GlobalStateContext).globalState?.user?.company;

  //const user = React.useContext(GlobalStateContext).globalState?.user;
  // const scheduleUser = schedule.employeesSelected.find((emp) => emp.id === user?.id);
  //const scheduleUser = { shift: "AM" }

  return (
    <div>
        <p>Date: {moment(schedule.start_date).format("DD/MM/yyyy")}</p>
        {schedule?.roster?.location?.name ? (
          <p>Location: {schedule?.roster?.location?.name}</p> 
        ) : (
          <p>Location: {company?.name}</p> 
        )}
        <p>Shift: {schedule?.shift}</p>
    </div>
  )
}

export default UpcomingShiftComponent