"use client";
import { useContext, useState, useEffect } from "react";
import { CustomFlowbiteTheme, Table, Spinner } from "flowbite-react";
import PersonalDateBox from "./personal-date-box";
import moment from "moment";
import ScheduleDateBox from "./schedule-date-box";
import React from "react";
import { ROLES } from "../../../configs/constants";
import { GlobalStateContext } from "../../../configs/global-state-provider";
import {
  getAllUserSchedule,
  getUserScheduleFromAndTo,
} from "../../../shared/api/user-schedule.api";
import { getRosterFromAndTo } from "../../api/roster.api";
import { IRoster, IUserSchedule } from "../../model/schedule.model";
import { IRequest } from "../../model/request.model";
import { getApprovedLeaveFromAndTo } from "../../api/request.api";

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
  location: number;
};

type CalObject = {
  days: moment.Moment[];
};

const CalendarMonthView = ({
  month,
  year = new Date().getFullYear(),
  isPersonal,
  location,
}: IProps) => {
  const { globalState } = useContext(GlobalStateContext);
  const [loading, setLoading] = React.useState(false);
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

  const [scheduleList, setScheduleList] = useState<IUserSchedule[]>([]);
  const [rosterList, setRosterList] = useState<IRoster[]>([]);
  const [leaveList, setLeaveList] = useState<IRequest[]>([]);

  useEffect(() => {
    const from = new Date(year, month);
    const to = new Date(year, month + 1);
    setLoading((prev) => true);
    if (isPersonal) {
      Promise.all([
        getUserScheduleFromAndTo(
          globalState?.user?.company_id || 0,
          globalState?.user?.id || 0,
          from,
          to
        ).then((res) => {
          setScheduleList(res.data);
        }),
        getApprovedLeaveFromAndTo(from, to).then((res) => {
          setLeaveList(res.data);
        }),
      ]).finally(() => {
        setLoading((prev) => false);
      });
    } else {
      getRosterFromAndTo(
        globalState?.user?.company_id || 0,
        location || 0,
        from,
        to
      )
        .then((res) => {
          if (globalState?.user?.role == ROLES.MANAGER) {
            setRosterList(res.data);
          } else {
            const resData: IRoster[] = res.data as IRoster[];
            const schedulesToRemove: number[] = [];
            resData.map((ros, ridx) => {
              if (ros.type == "SHIFT") {
                const filteredPositions = ros.positions?.filter((pos) => {
                  return pos.position === globalState?.user?.position; // Example condition
                });
                const filteredSchedulePositions = ros.schedules?.filter(
                  (sch) => {
                    return sch.user?.position === globalState?.user?.position;
                  }
                );
                if (filteredPositions && filteredSchedulePositions) {
                  if (
                    filteredSchedulePositions?.length <
                    filteredPositions[0]?.count
                  ) {
                    schedulesToRemove.push(ridx);
                  }
                }
              }
            });
            const filteredResData = resData.filter((_, ridx) =>
              schedulesToRemove.includes(ridx)
            );
            setRosterList(filteredResData);
          }
        })
        .finally(() => {
          setLoading((prev) => false);
        });
    }
  }, [isPersonal, month, year, location]);

  /*const scheduleForMonth = scheduleList?.filter(
    (schedule) =>
      schedule.start_date?.getMonth() === month &&
      schedule.start_date?.getFullYear() === year 
      // &&
      // schedule.location === location
  );*/

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
          {loading ? (
            <Table.Row>
              <Table.Cell colSpan={6} className="text-center">
                <Spinner size="xl" />
              </Table.Cell>
            </Table.Row>
          ) : (
            <>
              {cal.map((week, idx) => {
                return (
                  <Table.Row key={idx}>
                    {week.days.map((day, didx) => {
                      const scheduleForDay = scheduleList?.filter(
                        (schedule) => {
                          return (
                            moment(schedule.start_date).isSameOrBefore(day) &&
                            day.isSameOrBefore(moment(schedule.end_date))
                          );
                        }
                      );
                      const rosterForDay = rosterList?.filter((schedule) => {
                        const startDate = new Date(
                          schedule.start_date
                        ).getDate();
                        return startDate === day.date();
                      });
                      const leaveForDay = leaveList?.filter((leave) => {
                        return moment(leave?.leave_request?.start_date).isSameOrBefore(day) &&
                        day.isSameOrBefore(moment(leave?.leave_request?.end_date));
                      });
                      return (
                        <Table.Cell key={didx}>
                          {day.month() === month ? (
                            !isPersonal ? (
                              <ScheduleDateBox
                                date={day}
                                roster={
                                  rosterForDay?.length >= 1
                                    ? rosterForDay
                                    : null
                                }
                              />
                            ) : (
                              <PersonalDateBox
                                date={day}
                                schedule={
                                  scheduleForDay?.length >= 1
                                    ? scheduleForDay[0]
                                    : null
                                }
                                leave={
                                  leaveForDay?.length >= 1
                                    ? leaveForDay[0]
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
            </>
          )}
        </Table.Body>
      </Table>
    </div>
  );
};

export default CalendarMonthView;
