import { Avatar, Button, Card } from "flowbite-react";
import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { capitalizeString } from "../../configs/utils";
import UpcomingShiftComponent from "./upcoming-shift-component";
import { HiClock } from "react-icons/hi";
import PendingRequestComponent from "./pending-request-component";
import { REQUEST, ROLES } from "../../configs/constants";
import { toast } from "react-toastify";
import { IUserSchedule } from "../../shared/model/schedule.model";
import { getUserScheduleFromAndTo } from "../../shared/api/user-schedule.api";
import moment from "moment";
import { getAllPendingRequestByDepartmentId, getPersonalRequests } from "../../shared/api/request.api";
import { IRequest } from "../../shared/model/request.model";

const Home = () => {
  const user = React.useContext(GlobalStateContext).globalState?.user;
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);

  const CLOCK_IN = "Clock-in";
  const CLOCK_OUT = "Clock-out";
  const SCHEDULE_COMPLETED = "Schedule completed";

  const scheduleForTheDay = globalState?.schedule?.find(
    (val) =>
      val.start_date?.toLocaleDateString() === new Date().toLocaleDateString()
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

  const [scheduleForTheWeek, setScheduleForTheWeek] = React.useState<
    IUserSchedule[]
  >([]);
  const [pendingRequests, setPendingRequests] = React.useState<IRequest[]>([]);
  const [requestsPendingMyApproval, setRequestsPendingMyApproval] =
    React.useState<IRequest[]>([]);

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

  React.useEffect(() => {
    // TODO: retrieve schedules for the week
    Promise.all([
      getUserScheduleFromAndTo(
        user?.company_id || 0,
        user?.id || 0,
        new Date(),
        moment(new Date()).add(7, "days").toDate()
      ).then((res) => {
        setScheduleForTheWeek(res.data);
      }),
      getPersonalRequests(1, 5, undefined, `equals(status,${REQUEST.STATUS.PENDING})`).then((res) => {
        setPendingRequests(res.data);
      }),
    ]).catch((err) => {
      toast.error("Error retrieving information. Please try again later.", {
        toastId: "home",
      });
    });

    if (user?.role === ROLES.MANAGER && user?.department_in_charge) {
      // TODO: retrieve requests pending approval
      getAllPendingRequestByDepartmentId(
        user?.department_id || 0,
        1,
        5,
        undefined,
        "in(type,[leave,bid]"
      )
        .then((res) => {
          setRequestsPendingMyApproval(res.data);
        })
        .catch((err) => {
          toast.error("Error retrieving information. Please try again later.", {
            toastId: "home",
          });
        });
    }
  }, []);

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
      </div>
      <div className="md:w-4/5 md:border-l-2 md:px-5">
        <p className="header hidden md:block">Dashboard</p>
        {globalState?.user?.role !== ROLES.SYSADMIN && (
          <>
            <div className="mt-6 grid md:grid-cols-2 md:gap-x-12 gap-y-6">
              <div>
                <p className="sub-header">Upcoming Schedules</p>
                <Card>
                  {scheduleForTheWeek &&
                  scheduleForTheWeek.filter((s) => s.status === "")
                    .length > 0 ? (
                    scheduleForTheWeek
                      .filter((s) => s.status === "")
                      .map((shift, idx) => (
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
              <div>
                <p className="sub-header">Requests Pending For Approval</p>
                <Card>
                  {pendingRequests && pendingRequests.length > 0 ? (
                    <PendingRequestComponent
                      requests={pendingRequests}
                      personalRequest={true}
                    />
                  ) : (
                    <p>No pending requests found</p>
                  )}
                </Card>
              </div>
              {user?.role === ROLES.MANAGER && user?.department_in_charge ? (
                <div>
                  <p className="sub-header">Requests Pending Your Approval</p>
                  <Card>
                    {requestsPendingMyApproval &&
                    requestsPendingMyApproval.length > 0 ? (
                      <PendingRequestComponent
                        requests={requestsPendingMyApproval}
                        personalRequest={false}
                      />
                    ) : (
                      <p>No pending requests found</p>
                    )}
                  </Card>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
