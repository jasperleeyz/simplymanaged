"use client";
import { useContext, useState, useEffect } from "react";
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
import { HiCalendar, HiTemplate } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { getAllUserSchedule } from "../../shared/api/user-schedule.api";
import { getAllLocations } from "../../shared/api/location.api";
import { ICompanyLocation } from "../../shared/model/company.model";
import { getUserScheduleFromAndTo } from "../../shared/api/user-schedule.api";
import ShowRosterTemplateModal from "../../modules/schedule/manager/show-roster-template-modal";

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
  const { globalState } = useContext(GlobalStateContext);

  // TODO: to call retrieve schedule api here
  const [locationList, setLocationList] = useState<ICompanyLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const scheduleList =
    React.useContext(GlobalStateContext).globalState?.schedule;

  const [location, setLocation] = React.useState(0);
  const [month, setMonth] = React.useState(() => {
    return new Date().getMonth();
  });
  const [year, setYear] = React.useState(() => {
    return new Date().getFullYear();
  });
  const [isPersonal, setIsPersonal] = React.useState(() => {
    if (globalState?.user?.role === ROLES.EMPLOYEE) return true;
    return false;
  });

  useEffect(() => {
    setLoading((prev) => true);
    getAllLocations(globalState?.user?.company_id || 0)
      .then((res) => {
        setLocationList(res.data);
        setLocation(res.data[0].id);
      })
      .finally(() => {
        setLoading((prev) => false);
      });
  }, []);

  const range = (start, stop, step) =>
    Array.from(
      { length: (stop - start) / step + 1 },
      (_, i) => start + i * step
    );

  const [showRosterTemplateModal, setShowRosterTemplateModal] =
    React.useState(false);
  const modalProps = { showRosterTemplateModal, setShowRosterTemplateModal };

  return (
    <div>
      {!loading ? (
        <Flowbite theme={{ theme: customCalendarStyle }}>
          <div id="schedule-main">
            <p className="header">
              {isPersonal ? "My Schedule" : "All Schedules"}
            </p>
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
                {locationList.length > 0 ? (
                  <>
                    <Label htmlFor="location" value="Location" />
                    <Select
                      id="location"
                      sizing="sm"
                      value={location}
                      onChange={(e) => setLocation(Number(e.target.value))}
                    >
                      {locationList.map((l, idx) => (
                        <option key={idx} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </Select>
                  </>
                ) : null}
              </div>
              <div className="ms-auto mt-3 flex">
                <Button
                  size="sm"
                  onClick={() => setIsPersonal((prev) => !prev)}
                >
                  {!isPersonal
                    ? "View Personal Schedule"
                    : "View All Schedules"}
                </Button>
                {!isPersonal && globalState?.user?.role === ROLES.MANAGER && (
                  <div className="flex">
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowRosterTemplateModal((prev) => true);
                      }}
                      className="ml-3"
                    >
                      <HiTemplate className="my-auto mr-2" />
                      Roster Template
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate(`./${PATHS.CREATE_SCHEDULE}`)}
                      className="ml-3"
                    >
                      <HiCalendar className="my-auto mr-2" />
                      Create Roster
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <CalendarMonthView
              month={month}
              year={year}
              isPersonal={isPersonal}
              location={location}
            />
          </div>
          {<ShowRosterTemplateModal {...modalProps} />}
        </Flowbite>
      ) : null}
    </div>
  );
};

export default Calendar;
