import { Avatar, Card } from "flowbite-react";
import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { capitalizeString } from "../../configs/utils";
import UpcomingShiftComponent from "./upcoming-shift-component";
import PendingRequestComponent from "./pending-request-component";
import { REQUEST, ROLES } from "../../configs/constants";
import { toast } from "react-toastify";
import { IUserSchedule } from "../../shared/model/schedule.model";
import { getUserScheduleFromAndTo } from "../../shared/api/user-schedule.api";
import moment from "moment";
import {
  getAllRequestPendingEmployeeApproval,
  getAllRequestPendingManagerApproval,
  getPersonalRequests,
} from "../../shared/api/request.api";
import { IRequest } from "../../shared/model/request.model";

const Home = () => {
  const user = React.useContext(GlobalStateContext).globalState?.user;
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);

  const scheduleForTheDay = globalState?.schedule?.find(
    (val) =>
      val.start_date?.toLocaleDateString() === new Date().toLocaleDateString()
    // && val.employeesSelected.find((emp) => emp.id === user?.id)
  );

  const [scheduleForTheWeek, setScheduleForTheWeek] = React.useState<
    IUserSchedule[]
  >([]);
  const [pendingRequests, setPendingRequests] = React.useState<IRequest[]>([]);
  const [requestsPendingMyApproval, setRequestsPendingMyApproval] =
    React.useState<IRequest[]>([]);

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
      getPersonalRequests(
        1,
        5,
        undefined,
        `equals(status,${REQUEST.STATUS.PENDING})`
      ).then((res) => {
        setPendingRequests(res.data);
      }),
      user?.role === ROLES.MANAGER
        ? getAllRequestPendingManagerApproval(1, 5, "asc(created_date)").then(
            (res) => {
              setRequestsPendingMyApproval(res.data);
            }
          )
        : getAllRequestPendingEmployeeApproval(1, 5, "asc(created_date)").then(
            (res) => {
              setRequestsPendingMyApproval(res.data);
            }
          ),
    ]).catch((err) => {
      toast.error("Error retrieving information. Please try again later.", {
        toastId: "home",
      });
    });

    // if (user?.role === ROLES.MANAGER) {
    //   getAllPendingRequestByDepartmentId(
    //     user?.department_id || 0,
    //     1,
    //     5,
    //     undefined,
    //     "in(type,[leave,bid]"
    //   )
    //     .then((res) => {
    //       setRequestsPendingMyApproval(res.data);
    //     })
    //     .catch((err) => {
    //       toast.error("Error retrieving information. Please try again later.", {
    //         toastId: "home",
    //       });
    //     });
    // }
  }, []);
  return (
    <div className="w-full md:flex">
      <div className="md:w-1/5 text-center">
        <Avatar rounded size="xl" img={user?.profile_image} />
        <p className="mt-3 font-semibold text-xl">
          {capitalizeString(user?.fullname)}
        </p>
        <p>{capitalizeString(user?.position)}</p>
        <p>{capitalizeString(user?.department?.department_name)}</p>
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
                  scheduleForTheWeek.filter((s) => s.status === "").length >
                    0 ? (
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
