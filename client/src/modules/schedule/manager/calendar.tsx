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
import { MONTHS } from "../../../configs/constants";
import CalendarMonthView from "../../../shared/layout/schedule/calendar-month-view";
import CalendarWeekView from "../../../shared/layout/schedule/calendar-week-view";

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
  // TODO: to call retrieve schedule api here
  const locationList = ["Toa Payoh", "Ang Mo Kio"];
  const scheduleList = [];

  // TODO: update with default values
  const [schedule, setSchedule] = React.useState([]);
  const [dateRange, setDateRange] = React.useState({
    start: new Date().getDate(),
    end: new Date().getDate() + 7,
  });
  const [location, setLocation] = React.useState(() => {
    const l = history.state['scheduleLocation'];
    if(!l) return locationList[0];
    return l;
  });
  const [month, setMonth] = React.useState(() => {
    const m = history.state['scheduleMonth'];
    if(!m) return new Date().getMonth();
    return m;
  });
  const [view, setView] = React.useState(() => {
    const v = history.state['scheduleView'];
    if(!v) return 'month';
    return v;
  });

  // TODO: retrigger schedule retrieval when control values changed by user
  React.useEffect(() => {
    // api call to retrieve schedule
    
    // store new values to history state
    history.replaceState({
      scheduleMonth: month,
      scheduleView: view,
      scheduleLocation: location,
    }, '');
  }, [dateRange, location, month, view]);

  return (
    <Flowbite theme={{ theme: customCalendarStyle }}>
      <div id="mgr-schedule-main">
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
                  <option key={idx} value={l.value}>{l.label}</option>
                ))}
              </Select>
            </div>
          )}
          <div className="md:ms-24">
            <Label htmlFor="location" value="Location" />
            <Select
              id="location"
              sizing="sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {locationList.map((l, idx) => (
                <option key={idx} value={l}>{l}</option>
              ))}
            </Select>
          </div>
          <div className="ms-auto md:flex md:flex-wrap content-end">
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
          </div>
        </div>
        {view === "month" && <CalendarMonthView month={month} />}
        {view === "week" && <CalendarWeekView />}
      </div>
    </Flowbite>
  );
};

export default Calendar;
