"use client";
import { useState, useEffect } from "react";
import {
  Button,
  CustomFlowbiteTheme,
  Flowbite,
  Label,
  Select,
} from "flowbite-react";
import React from "react";
import { MONTHS, PATHS, ROLES } from "../../configs/constants";
import CalendarMonthView from "../../shared/layout/calendar/calendar-month-view";
import { HiCalendar } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { getUserSchedule, getAllUserSchedule } from "../../shared/api/user-schedule.api";
import { getAllLocations } from "../../shared/api/location.api"

const customCalendarStyle: CustomFlowbiteTheme = {
  buttonGroup: {
    position: {
      none: "focus:ring-2",
      start: "rounded-b-none",
      middle: "rounded-b-none border-l-0 pl-0",
      end: "rounded-b-none border-l-0 pl-0",
    },
  },
};

const Calendar = () => {
  const navigate = useNavigate();
  const user = React.useContext(GlobalStateContext).globalState?.user;

  // TODO: to call retrieve schedule api here
  const locationList = ["Toa Payoh", "Ang Mo Kio"];

  useEffect(() => {
    setLoading((prev) => true);
    getAllLocations(
      1
    )
      .then((res) => {
        console.log(res.data);
      })
      .finally(() => {
        setLoading((prev) => false);
        
      });
  }, []);
  
  const scheduleList =
    React.useContext(GlobalStateContext).globalState?.schedule;

  // TODO: update with default values
  const [schedule, setSchedule] = React.useState([]);
  const [dateRange, setDateRange] = React.useState({
    start: new Date().getDate(),
    end: new Date().getDate() + 7,
  });
  const [location, setLocation] = React.useState(() => {
    const l = history.state["scheduleLocation"];
    if (!l) return locationList[0];
    return l;
  });
  const [month, setMonth] = React.useState(() => {
    const m = history.state["scheduleMonth"];
    if (!m) return new Date().getMonth();
    return m;
  });
  const [year, setYear] = React.useState(() => {
    const y = history.state["scheduleYear"];
    if (!y) return new Date().getFullYear();
    return y;
  });
  const [isPersonal, setIsPersonal] = React.useState(() => {
    if (user?.role === ROLES.EMPLOYEE) return true;
    const ip = history.state["isPersonal"];
    if (!ip) return false;
    return ip;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading((prev) => true);
    getAllUserSchedule(
      0,
      month,
      year
    )
      .then((res) => {
        console.log(res.data);
      })
      .finally(() => {
        setLoading((prev) => false);
        
      });
  }, [month, year]);

  const range = (start, stop, step) =>
    Array.from(
      { length: (stop - start) / step + 1 },
      (_, i) => start + i * step
    );

  // TODO: retrigger schedule retrieval when control values changed by user
  React.useEffect(() => {
    // api call to retrieve schedule

    // store new values to history state
    history.replaceState(
      {
        scheduleMonth: month,
        scheduleYear: year,
        scheduleLocation: location,
        isPersonal: isPersonal,
      },
      ""
    );
  }, [dateRange, location, month, year, isPersonal]);

  return (
    <Flowbite theme={{ theme: customCalendarStyle }}>
      <div id="schedule-main">
        <p className="header">{isPersonal ? "My Schedule" : "All Schedules"}</p>
        <div className="w-full mb-6 md:flex md:flex-wrap">
          <div className="grid grid-cols-2">
            <div>
              <Label htmlFor="month" value="Month" />
              <Select
                id="month"
                sizing="sm"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {MONTHS.map((l, idx) => (
                  <option key={idx} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="year" value="Year" />
              <Select
                id="year"
                sizing="sm"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {range(
                  new Date().getFullYear() - 1,
                  new Date().getFullYear() + 2,
                  1
                ).map((l, idx) => (
                  <option key={idx} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="mt-3 md:mt-0 md:ms-24">
            <Label htmlFor="location" value="Location" />
            <Select
              id="location"
              sizing="sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {locationList.map((l, idx) => (
                <option key={idx} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
          {user?.role === ROLES.MANAGER && (
            <div className="ms-auto mt-3 flex">
              <Button size="sm" onClick={() => setIsPersonal((prev) => !prev)}>
                {!isPersonal ? "View Personal Schedule" : "View All Schedules"}
              </Button>
              {!isPersonal && (
                <Button
                  size="sm"
                  onClick={() => navigate(`./${PATHS.CREATE_SCHEDULE}`)}
                  className="ml-3"
                >
                  <HiCalendar className="my-auto mr-2" />
                  <p>Create Schedule</p>
                </Button>
              )}
            </div>
          )}
        </div>
        <CalendarMonthView
          month={month}
          year={year}
          isPersonal={isPersonal}
          location={location}
        />
      </div>
    </Flowbite>
  );
};

export default Calendar;
