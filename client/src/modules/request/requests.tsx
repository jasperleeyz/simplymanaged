"use client";

import { Button, Pagination, Table } from "flowbite-react";
import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { IRequest } from "../../shared/model/request.model";
import { capitalizeString } from "../../configs/utils";
import { DATE, PATHS, ROLES } from "../../configs/constants";
import { useNavigate } from "react-router-dom";
import ApproveButton from "../../shared/layout/buttons/approve-button";
import RejectButton from "../../shared/layout/buttons/reject-button";
import { toast } from "react-toastify";
import { HiCalendar } from "react-icons/hi";
import PersonalRequests from "./personal-requests";

const Requests = () => {
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  // const [requests, setRequests] = React.useState<Request[]>([]);
  const requests = globalState?.requests?.filter((req) => {
    if (globalState.user?.role === "E") {
      return req.type === "swap" ? req : null;
    } else {
      return req.type !== "swap" ? req : null;
    }
  });
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState(1);

  const [isPersonal, setIsPersonal] = React.useState(() => {
    if (globalState?.user?.role === ROLES.EMPLOYEE) return true;
    const ip = history.state["isPersonal"];
    if (!ip) return false;
    return ip;
  });

  const updateStatus = (req: IRequest, status: string) => {
    // TODO: replace with api call for updating status
    req.status = status;
    setGlobalState((prev) => ({
      ...prev,
      requests: prev.requests?.map((r) => (r.id === req.id ? req : r)),
    }));

    toast.success(`Successfully ${status} request`);
  };

  // load initial request data from api
  React.useEffect(() => {
    // get requests
  }, []);

  return (
    <div id="request-main">
      <p className="header">{isPersonal ? `My ` : ""}Requests</p>
      <div className="flex justify-end mb-3">
        {isPersonal ? (
          <>
            <Button
              size="sm"
              onClick={() => {
                navigate(`./${PATHS.ADD_LEAVE_REQUEST}`);
              }}
            >
              <HiCalendar className="mr-2 my-auto" />
              <p>Apply Leave</p>
            </Button>
          </>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        {isPersonal ? (
          <PersonalRequests page={currentPage} sizePerPage={10} />
        ) : (
          <Table striped>
            <Table.Head>
              <Table.HeadCell>Name of Requestor</Table.HeadCell>
              <Table.HeadCell>Details</Table.HeadCell>
              <Table.HeadCell>Request Type</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {requests &&
              requests.filter((req) => req.status === "pending").length > 0 ? (
                requests
                  .filter((req) => req.status === "pending")
                  .map((request, idx) => (
                    <Table.Row key={idx}>
                      <Table.Cell>{request.created_by}</Table.Cell>
                      <Table.Cell>
                        {request.type === "leave" ? (
                          <>
                            <p>{`${request.leave_request?.start_date.toLocaleDateString(
                              DATE.LANGUAGE,
                              DATE.DDMMYYYY_HHMM_A_OPTION
                            )}`}</p>
                            <p className="my-2">to</p>
                            <p>{`${request.leave_request?.end_date.toLocaleTimeString(
                              DATE.LANGUAGE,
                              DATE.DDMMYYYY_HHMM_A_OPTION
                            )}`}</p>
                          </>
                        ) : request.type === "shift" ? (
                          <p>
                            {`${request.bid_request?.start_date.toLocaleDateString()}, ${
                              request.bid_request?.shift
                            } Shift`}
                          </p>
                        ) : (
                          <>
                            <p>
                              {`His/Her schedule: ${request.swap_request?.requester_schedule.start_date.toLocaleDateString(
                                DATE.LANGUAGE
                              )}, ${request.swap_request?.requester_schedule.start_date.toLocaleDateString(
                                DATE.LANGUAGE,
                                { weekday: "long" }
                              )},
                            ${request.swap_request?.requester_schedule.shift}
                          `}
                            </p>
                            <p>{`Your schedule: ${request.swap_request?.requested_schedule.start_date.toLocaleDateString(
                              DATE.LANGUAGE
                            )}, ${request.swap_request?.requested_schedule.start_date.toLocaleDateString(
                              DATE.LANGUAGE,
                              { weekday: "long" }
                            )},
                            ${request.swap_request?.requested_schedule.shift}
                          `}</p>
                          </>
                        )}
                      </Table.Cell>
                      <Table.Cell>{capitalizeString(request.type)}</Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2 items-center justify-center">
                          <Button
                            size="sm"
                            onClick={() => {
                              navigate(`./${PATHS.VIEW_REQUEST}`, {
                                state: { request },
                              });
                            }}
                          >
                            View
                          </Button>
                          {request.status === "pending" && (
                            <>
                              <ApproveButton
                                size="sm"
                                onClick={() =>
                                  updateStatus(request, "approved")
                                }
                              />
                              <RejectButton
                                size="sm"
                                onClick={() =>
                                  updateStatus(request, "rejected")
                                }
                              />
                            </>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
              ) : (
                <Table.Row>
                  <Table.Cell align="center" colSpan={4}>
                    No results
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </div>
      <div className="flex mt-4 text-center justify-center items-center">
        <Pagination
          currentPage={1}
          layout="pagination"
          onPageChange={(page) => {
            setCurrentPage(page);
          }}
          showIcons
          totalPages={1}
        />
      </div>
    </div>
  );
};

export default Requests;
