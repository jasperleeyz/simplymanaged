import moment from 'moment'
import React from 'react'
import { IUserSchedule } from '../../shared/model/schedule.model'
import { GlobalStateContext } from '../../configs/global-state-provider'


interface IProps {
    schedule: IUserSchedule;
}

const UpcomingShiftComponent = ({ schedule }: IProps) => {
  const company = React.useContext(GlobalStateContext).globalState?.user?.company;

  return (
    <div>
        <p>Date: {moment(schedule.start_date).format("DD/MM/YYYY")}{
          !moment(schedule.start_date).startOf('day').isSame(moment(schedule.end_date).startOf('day'))
         ? ` to ${moment(schedule.end_date).format("DD/MM/YYYY")}` : null}</p>
        {schedule?.roster?.location?.name ? (
          <p>Location: {schedule?.roster?.location?.name}</p> 
        ) : (
          null 
        )}
        <p>Shift: {schedule?.shift}</p>
        
    </div>
  )
}

export default UpcomingShiftComponent