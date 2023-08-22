import { Avatar, Button, Card } from "flowbite-react";
import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { capitalizeString } from "../../configs/utils";
import UpcomingShiftComponent from "./upcoming-shift-component";

const Home = () => {
  const user = React.useContext(GlobalStateContext).globalState?.user;

  // TODO: retrieve shifts for the week
  const scheduleForTheWeek = [{date: new Date(), shift: 'AM', duration: 4, location: 'Toa Payoh'}];

  // TODO: retrieve request pending approval
  const pendingRequests = [];

  return (
    <div className="w-full md:flex">
      <div className="md:w-1/5 text-center">
        <Avatar rounded size="xl" img={user?.profileImage} />
        <p className="mt-3 font-semibold text-xl">
          {capitalizeString(user?.name)}
        </p>
        <p>{capitalizeString(user?.position)}</p>
        <Button className="mx-auto mt-5" size="sm">
          Clock-in
        </Button>
      </div>
      <div className="md:w-4/5 md:border-l-2 md:px-5">
        <p className="header">Dashboard</p>
        <div className="mt-6 md:min-h-max md:flex">
          <div className="w-1/2 mr-5">
            <p className="sub-header">Upcoming Schedules</p>
            <Card className="w-11/12">
              {scheduleForTheWeek.length > 0 ? (
                scheduleForTheWeek.map((shift, idx) => (
                  <UpcomingShiftComponent key={idx} schedule={shift}/>
                ))
              ) : (
                <>
                  <p>No upcoming shifts found</p>
                  <p className="text-sm text-gray-500">Enjoy your week!</p>
                </>
              )}
            </Card>
          </div>
          <div className="w-1/2">
            <p className="sub-header">Needs Approval</p>
            <Card className="w-11/12">
              {pendingRequests.length > 0 ? (
                <></>
              ) : (
                <p>No pending requests found</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
