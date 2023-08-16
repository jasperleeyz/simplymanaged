import { Button } from "flowbite-react";
import React from "react";
import { PathRouteProps } from "react-router-dom";

interface IProps extends PathRouteProps {
  date?: number;
  schedule?: any;
}

const CalendarDateBox = ({ date = 1, schedule = null }: IProps) => {
  return (
    <div className="w-[110px] h-[110px] max-w-sm max-h-sm group">
      <p>{date}</p>
      <br />
      {!schedule && (
        <div className="relative">
          <p className="absolute whitespace-normal">No schedule for the day</p>
          <Button size="sm" className='absolute hidden group-hover:block' color="info">Add schedule</Button>
        </div>
      )}
      {/* <div>hello</div> */}
    </div>
  );
};

export default CalendarDateBox;
