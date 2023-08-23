"use client";

import {
  Button,
  CustomFlowbiteTheme,
  Flowbite,
  Label,
  Select,
  TextInput,
} from "flowbite-react";
import React from "react";
import { MONTHS, PATHS } from "../../configs/constants";
import CalendarMonthView from "../../shared/layout/calendar/calendar-month-view";
import CalendarWeekView from "../../shared/layout/calendar/calendar-week-view";
import { HiCalendar } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

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

  // TODO: to call retrieve schedule api here
  const locationList = ["Toa Payoh", "Ang Mo Kio"];
  const isPersonalList = []; // only load if is scheduler/manager role
  const scheduleList = [];

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
  const [view, setView] = React.useState(() => {
    const v = history.state["scheduleView"];
    if (!v) return "month";
    return v;
  });
  const [isPersonal, setIsPersonal] = React.useState(() => {
    const ip = history.state["isPersonal"];
    if (!ip) return false;
    return ip;
  });

  // TODO: retrigger schedule retrieval when control values changed by user
  React.useEffect(() => {
    // api call to retrieve schedule

    // store new values to history state
    history.replaceState(
      {
        scheduleMonth: month,
        scheduleView: view,
        scheduleLocation: location,
        isPersonal: isPersonal,
      },
      ""
    );
  }, [dateRange, location, month, view, isPersonal]);

  return (
    <Flowbite theme={{ theme: customCalendarStyle }}>
      <div id="mgr-schedule-main">
        <p className="header">{isPersonal ? "My Schedule" : "All Schedules"}</p>
        <div className="w-full mb-6 md:flex md:flex-wrap">
          {view === "week" && (
            <div>
              <Label htmlFor="cal-date-range" value="Date" />
              <TextInput
                id="cal-date-range"
                type="date"
                sizing="sm"
                // value={dateRange.start}
                // onChange={(e) =>
                //   setDateRange({ start: e.target.value, end: dateRange.end })
                // }
              />
            </div>
          )}
          {view === "month" && (
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
          )}
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
          {/* <div className="ms-auto md:flex md:flex-wrap content-end">
            <Button.Group>
              <Button
                color={view === "week" ? "dark" : ""}
                onClick={() => setView("week")}
              >
                Week
              </Button>
              <Button
                color={view === "month" ? "dark" : ""}
                onClick={() => setView("month")}
              >
                Month
              </Button>
            </Button.Group>
          </div> */}
        </div>
        {view === "month" && <CalendarMonthView month={month} isPersonal={isPersonal} />}
        {view === "week" && <CalendarWeekView />}
      </div>
    </Flowbite>
  );
};

export default Calendar;