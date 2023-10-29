import { Avatar, Button, Card } from "flowbite-react";
import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { capitalizeString } from "../../configs/utils";
import UpcomingShiftComponent from "./upcoming-shift-component";
import { HiClock } from "react-icons/hi";
import PendingRequestComponent from "./pending-request-component";
import { ROLES } from "../../configs/constants";
import { toast } from "react-toastify";
import { IUserSchedule } from "../../shared/model/schedule.model";

const Home = () => {
  const user = React.useContext(GlobalStateContext).globalState?.user;
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);

  const CLOCK_IN = "Clock-in";
  const CLOCK_OUT = "Clock-out";
  const SCHEDULE_COMPLETED = "Schedule completed";

  const scheduleForTheDay = globalState?.schedule?.find(
    (val) =>
      val.startDate?.toLocaleDateString() === new Date().toLocaleDateString()
      // && val.employeesSelected.find((emp) => emp.id === user?.id)
  );

  const [clockedIn, setClockedIn] = React.useState(() => {
    // if (
    //   scheduleForTheDay &&
    //   scheduleForTheDay.employeesSelected.find((emp) => emp.id === user?.id)
    //     ?.attendance === "I"
    // ) {
    //   return CLOCK_OUT;
    // }

    // if (
    //   scheduleForTheDay &&
    //   scheduleForTheDay.employeesSelected.find((emp) => emp.id === user?.id)
    //     ?.attendance === "P"
    // ) {
    //   return SCHEDULE_COMPLETED;
    // }

    return CLOCK_IN;
  });

  // TODO: retrieve shifts for the week
  const scheduleForTheWeek = [
    scheduleForTheDay,
  ] as IUserSchedule[];

  // TODO: retrieve request pending approval
  const pendingRequests = globalState?.requests?.filter(
    (req) =>
      req.status === "pending" &&
      (globalState?.user?.role === ROLES.MANAGER
        ? req.type !== "swap"
        : req.type === "swap")
  );

  const clockIn = () => {
    // if (scheduleForTheDay) {
    //   const idx = scheduleForTheDay.employeesSelected.findIndex(
    //     (emp) => emp.id === user?.id
    //   );
    //   scheduleForTheDay.employeesSelected[idx].attendance =
    //     clockedIn === CLOCK_OUT ? "P" : "I";

    //   setGlobalState((prev) => ({
    //     ...prev,
    //     schedule: prev.schedule.map((val) =>
    //       val.id === scheduleForTheDay.id ? scheduleForTheDay : val
    //     ),
    //   }));

    //   setClockedIn((prev) =>
    //     prev === CLOCK_IN
    //       ? CLOCK_OUT
    //       : prev === CLOCK_OUT
    //       ? SCHEDULE_COMPLETED
    //       : CLOCK_IN
    //   );

    //   toast.success(
    //     `Successfully ${clockedIn === CLOCK_IN ? "clocked-in" : "clocked-out"}!`
    //   );
    // }
  };

  return (
    <div className="w-full md:flex">
      <div className="md:w-1/5 text-center">
        <Avatar rounded size="xl" img={user?.profile_image} />
        <p className="mt-3 font-semibold text-xl">
          {capitalizeString(user?.fullname)}
        </p>
        <p>{capitalizeString(user?.position)}</p>
        <Button
          className="mx-auto mt-5"
          size="sm"
          disabled={!scheduleForTheDay || clockedIn === SCHEDULE_COMPLETED}
          onClick={() => clockIn()}
        >
          <HiClock className="my-auto mr-2" />
          <p>{clockedIn}</p>
        </Button>
        <Button
          className="mx-auto mt-5"
          size="sm"
          onClick={() => {
            const usr = globalState?.user;
            if (usr) {
              usr.id = 0;
              usr.role = ROLES.SYSADMIN;
            }
            setGlobalState((prev) => ({ ...prev, user: usr }));
          }}
        >
          <p>Switch to sysadmin</p>
        </Button>
        <Button
          className="mx-auto mt-5"
          size="sm"
          onClick={() => {
            const usr = globalState?.user;
            if (usr) {
              usr.id = 1;
              usr.role = ROLES.EMPLOYEE;
            }
            setGlobalState((prev) => ({ ...prev, user: usr }));
          }}
        >
          <p>Switch to employee</p>
        </Button>
        <Button
          className="mx-auto mt-5"
          size="sm"
          onClick={() => {
            const usr = globalState?.user;
            if (usr) {
              usr.id = 1;
              usr.role = ROLES.MANAGER;
            }
            setGlobalState((prev) => ({ ...prev, user: usr }));
          }}
        >
          <p>Switch to manager</p>
        </Button>
      </div>
      <div className="md:w-4/5 md:border-l-2 md:px-5">
        <p className="header hidden md:block">Dashboard</p>
        {globalState?.user?.role !== ROLES.SYSADMIN && (
          <>
            <div className="mt-6 md:min-h-max md:flex">
              <div className="md:w-1/2 md:mr-5">
                <p className="sub-header">Upcoming Schedules</p>
                <Card className="md:w-11/12">
                  {/* {scheduleForTheWeek && scheduleForTheWeek.filter((s) => s.employeesSelected.find((emp) => emp.id === user?.id && emp.attendance === "N")).length > 0 ? (
                    scheduleForTheWeek.filter((s) => s.employeesSelected.find((emp) => emp.id === user?.id && emp.attendance === "N")).map((shift, idx) => (
                      <UpcomingShiftComponent key={idx} schedule={shift} />
                    ))
                  ) : (
                    <>
                      <p>No upcoming shifts found</p>
                      <p className="text-sm text-gray-500">Enjoy your week!</p>
                    </>
                  )} */}
                </Card>
              </div>
              <div className="mt-5 md:mt-0 md:w-1/2">
                <p className="sub-header">Requests Pending Approval</p>
                <Card className="md:w-11/12">
                  {pendingRequests && pendingRequests.length > 0 ? (
                    <PendingRequestComponent requests={pendingRequests} />
                  ) : (
                    <p>No pending requests found</p>
                  )}
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
