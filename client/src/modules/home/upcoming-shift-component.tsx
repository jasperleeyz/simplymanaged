import moment from 'moment'
import React from 'react'


interface IProps {
    schedule: any //TODO: update into schedule model
}

const UpcomingShiftComponent = ({ schedule }: IProps) => {
  return (
    <div>
        <p>Date: {moment(schedule.date).format("DD/MM/yyyy")}</p>
        <p>Location: {schedule.location}</p>
        <p>Shift: {schedule.shift}</p>
    </div>
  )
}

export default UpcomingShiftComponent