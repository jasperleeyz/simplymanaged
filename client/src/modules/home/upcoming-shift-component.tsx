import moment from 'moment'
import React from 'react'
import { IUserSchedule } from '../../shared/model/schedule.model'
import { GlobalStateContext } from '../../configs/global-state-provider'


interface IProps {
    schedule: IUserSchedule;
}

const UpcomingShiftComponent = ({ schedule }: IProps) => {

  const user = React.useContext(GlobalStateContext).globalState?.user;
  // const scheduleUser = schedule.employeesSelected.find((emp) => emp.id === user?.id);
  const scheduleUser = { shift: "AM" }

  return (
    <div>
        {/* <p>Date: {moment(schedule.date).format("DD/MM/yyyy")}</p>
        <p>Location: {schedule.location}</p> */}
        <p>Shift: {scheduleUser?.shift}</p>
    </div>
  )
}

export default UpcomingShiftComponent