import { Avatar, Button, Card } from "flowbite-react";
import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { capitalizeString } from "../../configs/utils";
import UpcomingShiftComponent from "./upcoming-shift-component";
import { HiClock } from "react-icons/hi";
import PendingRequestComponent from "./pending-request-component";
import { ROLES } from "../../configs/constants";

const Home = () => {
  const user = React.useContext(GlobalStateContext).globalState?.user;
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);

  // TODO: retrieve shifts for the week
  const scheduleForTheWeek = [
    { date: new Date(), shift: "AM", duration: 4, location: "Toa Payoh" },
  ];

  // TODO: retrieve request pending approval
  const pendingRequests = globalState?.requests.filter(
    (req) =>
      req.status === "pending" &&
      (globalState?.user?.role === ROLES.SCHEDULER
        ? req.type !== "swap"
        : req.type === "swap")
  );

  return (
    <div className="w-full md:flex">
      <div className="md:w-1/5 text-center">
        <Avatar rounded size="xl" img={user?.profileImage} />
        <p className="mt-3 font-semibold text-xl">
          {capitalizeString(user?.name)}
        </p>
        <p>{capitalizeString(user?.position)}</p>
        <Button className="mx-auto mt-5" size="sm">
          <HiClock className="my-auto mr-2" />
          <p>Clock-in</p>
        </Button>
        <Button
          className="mx-auto mt-5"
          size="sm"
          onClick={() => {
            const usr = globalState?.user;
            if (usr) usr.role = ROLES.SYSADMIN;
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
            if (usr) usr.role = ROLES.EMPLOYEE;
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
            if (usr) usr.role = ROLES.SCHEDULER;
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
                  {scheduleForTheWeek && scheduleForTheWeek.length > 0 ? (
                    scheduleForTheWeek.map((shift, idx) => (
                      <UpcomingShiftComponent key={idx} schedule={shift} />
                    ))
                  ) : (
                    <>
                      <p>No upcoming shifts found</p>
                      <p className="text-sm text-gray-500">Enjoy your week!</p>
                    </>
                  )}
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
