"use client";

import { CustomFlowbiteTheme, Table } from "flowbite-react";
import PersonalDateBox from "./personal-date-box";
import moment from "moment";
import ScheduleDateBox from "./schedule-date-box";
import React from "react";
import { GlobalStateContext } from "../../../configs/global-state-provider";

const customTableTheme: CustomFlowbiteTheme["table"] = {
  root: {
    base: "min-w-full text-left text-sm text-gray-500 dark:text-gray-400",
    shadow:
      "absolute bg-white dark:bg-black h-full top-0 left-0 rounded-lg drop-shadow-md -z-10",
    wrapper: "relative",
  },
};

type IProps = {
  month: number;
  year?: number;
  isPersonal: boolean;
  location: string;
};

type CalObject = {
  days: moment.Moment[];
};

const CalendarMonthView = ({
  month,
  year = new Date().getFullYear(),
  isPersonal,
  location
}: IProps) => {
  const cal = [] as CalObject[];

  const date = moment(new Date(year, month, 1));
  const startDay = date.clone().startOf("month").startOf("week");
  const endDay = date.clone().endOf("month").endOf("week");

  const itr = startDay.clone().subtract(1, "day");

  while (itr.isBefore(endDay, "day")) {
    cal.push({
      days: Array(7)
        .fill(0)
        .map(() => itr.add(1, "day").clone()),
    });
  }

  const scheduleList =
    React.useContext(GlobalStateContext).globalState?.schedule;

  const scheduleForMonth = scheduleList?.filter(
    (schedule) =>
      schedule.start_date?.getMonth() === month &&
      schedule.start_date?.getFullYear() === year 
      // &&
      // schedule.location === location
  );

  return (
    <div id="cal-month" className="overflow-x-auto">
      <Table theme={customTableTheme}>
        <Table.Head>
          <Table.HeadCell>Sunday</Table.HeadCell>
          <Table.HeadCell>Monday</Table.HeadCell>
          <Table.HeadCell>Tuesday</Table.HeadCell>
          <Table.HeadCell>Wednesday</Table.HeadCell>
          <Table.HeadCell>Thursday</Table.HeadCell>
          <Table.HeadCell>Friday</Table.HeadCell>
          <Table.HeadCell>Saturday</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {cal.map((week, idx) => {
            return (
              <Table.Row key={idx}>
                {week.days.map((day, didx) => {
                  const scheduleForDay = scheduleForMonth?.filter(
                    (schedule) => schedule.start_date?.getDate() === day.date()
                  );

                  return (
                    <Table.Cell key={didx}>
                      {day.month() === month ? (
                        !isPersonal ? (
                          <ScheduleDateBox
                            date={day}
                            schedule={
                              scheduleForDay?.length === 1
                                ? scheduleForDay[0]
                                : null
                            }
                          />
                        ) : (
                          <PersonalDateBox
                            date={day}
                            schedule={
                              scheduleForDay?.length === 1
                                ? scheduleForDay[0]
                                : null
                            }
                          />
                        )
                      ) : null}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
};

export default CalendarMonthView;
