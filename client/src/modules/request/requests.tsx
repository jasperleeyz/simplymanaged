"use client";

import { Button, Pagination, Spinner, Table } from "flowbite-react";
import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { IRequest } from "../../shared/model/request.model";
import { DATE, PATHS, REQUEST, ROLES } from "../../configs/constants";
import { useNavigate } from "react-router-dom";
import ApproveButton from "../../shared/layout/buttons/approve-button";
import RejectButton from "../../shared/layout/buttons/reject-button";
import { toast } from "react-toastify";
import { HiCalendar } from "react-icons/hi";
import PersonalRequests from "./personal-requests";
import {
  getAllRequestPendingEmployeeApproval,
  getAllRequestPendingManagerApproval,
  updateRequest,
} from "../../shared/api/request.api";
import moment from "moment";
import { getAllCompanyCodes } from "../../shared/api/company-code.api";

interface ILoading {
  id: number;
  status: string;
}

const Requests = () => {
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState<number>(() => {
    const cp = history.state["currentPage"];
    if (!cp) return 1;
    return cp;
  });
  const [sizePerPage, setSizePerPage] = React.useState<number>(() => {
    const sp = history.state["sizePerPage"];
    if (!sp) return 10;
    return sp;
  });
  const [totalPages, setTotalPages] = React.useState(1);
  const [requestList, setRequestList] = React.useState<IRequest[]>([]);

  const [isPersonal, setIsPersonal] = React.useState(() => {
    const ip = history.state["isPersonal"];
    if (!ip) return false;
    return ip;
  });

  const [requestLoading, setRequestLoading] = React.useState<boolean>(false);
  const [actionLoading, setActionLoading] = React.useState<ILoading[]>([]);
  const [refreshPage, setRefreshPage] = React.useState<boolean>(false);
  const [leaveTypeList, setLeaveTypeList] = React.useState<any[]>([]);

  const updateStatus = (req: IRequest, status: string) => {
    setActionLoading((prev) => [...prev, { id: req.id, status }]);
    updateRequest({ ...req, status })
      .then((res) => {
        setRequestList((prev) =>
          prev.map((r) => (r.id === req.id ? res.data : r))
        );
        toast.success(
          `Successfully ${REQUEST.STATUS[status]?.toLowerCase()} request`
        );
      })
      .catch((err) => {
        toast.error("Failed to update request. Please try again later.", {
          toastId: "request-status-update",
        });
      })
      .finally(() => {
        setActionLoading((prev) =>
          prev.filter((loading) => loading.id !== req.id)
        );
        setRefreshPage(true)
      });
  };

  // load initial request data from api
  React.useEffect(() => {
    setRequestLoading((prev) => true);
    // get requests
    if (!isPersonal) {
      if (globalState?.user?.role === ROLES.MANAGER) {
        // get swap and bid requests pending manager approval,
        // additionally get leave requests pending head of department approval if manager is head of department
        getAllRequestPendingManagerApproval(
          currentPage,
          sizePerPage,
          "asc(created_date)",
          undefined
        )
          .then((res) => {
            setRequestList(res.data);
            setTotalPages(res.totalPages);
          })
          .catch((err) => {
            toast.error("Error retrieving requests. Please try again later.");
          })
          .finally(() => setRequestLoading((prev) => false));
      } else {
        // get swap requests pending approval
        getAllRequestPendingEmployeeApproval(
          currentPage,
          sizePerPage,
          "asc(created_date)",
          undefined
        )
          .then((res) => {
            setRequestList(res.data);
            setTotalPages(res.totalPages);
          })
          .catch((err) => {
            toast.error("Error retrieving requests. Please try again later.");
          })
          .finally(() => {setRequestLoading((prev) => false)
          setRefreshPage(false)});
      }
    }

    history.replaceState({ isPersonal, currentPage, sizePerPage }, "");
  }, [isPersonal, currentPage, sizePerPage, refreshPage]);

  React.useEffect(() => {
    Promise.all([
      getAllCompanyCodes(
        globalState?.user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        `equals(code_type,leave_type)`
      ).then((res) => {
        setLeaveTypeList(res.data);
      }),
    ])
  }, []);

  return (
    <div id="request-main">
      <p className="header">{isPersonal ? `My ` : ""}Requests</p>
      <div className="flex justify-end mb-3 gap-2">
        <Button
          size="sm"
          onClick={() => {
            setIsPersonal((prev) => !prev);
          }}
        >
          <p>View {isPersonal ? `Pending Approval` : `Personal`} Requests</p>
        </Button>
        <Button
          size="sm"
          onClick={() => {
            navigate(`./${PATHS.ADD_LEAVE_REQUEST}`);
          }}
        >
          <HiCalendar className="mr-2 my-auto" />
          <p>Apply Leave</p>
        </Button>
      </div>
      <div className="overflow-x-auto">
        {isPersonal ? (
          <PersonalRequests page={currentPage} sizePerPage={10} leaveTypeList={leaveTypeList}/>
        ) : (
          <Table striped>
            <Table.Head>
              <Table.HeadCell>Name of Requestor</Table.HeadCell>
              <Table.HeadCell>Details</Table.HeadCell>
              <Table.HeadCell>Request Type</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {requestLoading ? (
                <Table.Row>
                  <Table.Cell align="center" colSpan={5}>
                    <Spinner />
                  </Table.Cell>
                </Table.Row>
              ) : (
                <>
                  {requestList &&
                  requestList.filter(
                    (req) => req.status === REQUEST.STATUS.PENDING
                  ).length > 0 ? (
                    requestList
                      .filter((req) => req.status === REQUEST.STATUS.PENDING)
                      .map((request, idx) => (
                        <Table.Row key={idx}>
                          <Table.Cell>{request.created_by}</Table.Cell>
                          <Table.Cell>
                            {request.type.toUpperCase() ===
                            REQUEST.TYPE.LEAVE ? (
                              <>
                                <p>
                                  {`${moment(
                                    request.leave_request?.start_date
                                  ).format(DATE.MOMENT_DDMMYYYY)}`}{" "}
                                  to{" "}
                                  {`${moment(
                                    request.leave_request?.end_date
                                  ).format(DATE.MOMENT_DDMMYYYY)}`}
                                </p>
                                <p>{leaveTypeList.find((lt) => lt.code === request.leave_request?.type).description}</p>
                                {request.leave_request?.half_day && (
                                  <p>{`Half-day?: ${request.leave_request?.half_day}`}</p>
                                )}
                              </>
                            ) : request.type.toUpperCase() ===
                              REQUEST.TYPE.BID ? (
                              <p>
                                {`${moment(
                                  request.bid_request?.start_date
                                ).format(DATE.MOMENT_DDMMYYYY)}, ${
                                  request.bid_request?.shift
                                } Shift`}
                              </p>
                            ) : (
                              <>
                                <p>
                                  {`His/Her schedule: ${moment(
                                    request.swap_request?.requester_schedule
                                      ?.start_date
                                  ).format(DATE.MOMENT_DDMMYYYY)}, ${moment(
                                    request.swap_request?.requester_schedule
                                      ?.start_date
                                  ).format("dddd")},
                            ${request.swap_request?.requester_schedule?.shift}
                          `}
                                </p>
                                <p>{`Your schedule: ${moment(
                                  request.swap_request?.requested_schedule
                                    ?.start_date
                                ).format(DATE.MOMENT_DDMMYYYY)}, ${moment(
                                  request.swap_request?.requested_schedule
                                    ?.start_date
                                ).format("dddd")},
                            ${request.swap_request?.requested_schedule?.shift}
                          `}</p>
                              </>
                            )}
                          </Table.Cell>
                          <Table.Cell>{request.type}</Table.Cell>
                          <Table.Cell>
                            {REQUEST.STATUS[request.status]}
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex gap-2 items-center justify-center">
                              <Button
                                size="sm"
                                disabled={
                                  actionLoading.find(
                                    (val) => val.id === request.id
                                  ) !== undefined
                                }
                                onClick={() => {
                                  navigate(
                                    `./${PATHS.VIEW_REQUEST}/${request.id}`
                                  );
                                }}
                              >
                                View
                              </Button>
                              {request.status === REQUEST.STATUS.PENDING && (
                                <>
                                  <ApproveButton
                                    size="sm"
                                    disabled={
                                      actionLoading.find(
                                        (val) => val.id === request.id
                                      ) !== undefined
                                    }
                                    isProcessing={
                                      actionLoading.find(
                                        (val) =>
                                          val.id === request.id &&
                                          val.status === REQUEST.STATUS.APPROVED
                                      ) !== undefined
                                    }
                                    onClick={() =>{
                                      updateStatus(
                                        request,
                                        REQUEST.STATUS.APPROVED
                                      )
                                    }
                                    }
                                  />
                                  <RejectButton
                                    size="sm"
                                    disabled={
                                      actionLoading.find(
                                        (val) => val.id === request.id
                                      ) !== undefined
                                    }
                                    isProcessing={
                                      actionLoading.find(
                                        (val) =>
                                          val.id === request.id &&
                                          val.status === REQUEST.STATUS.REJECTED
                                      ) !== undefined
                                    }
                                    onClick={() =>{
                                      updateStatus(
                                        request,
                                        REQUEST.STATUS.REJECTED
                                      )
                                    }
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
                      <Table.Cell align="center" colSpan={5}>
                        No results
                      </Table.Cell>
                    </Table.Row>
                  )}
                </>
              )}
            </Table.Body>
          </Table>
        )}
      </div>
      <div className="flex mt-4 text-center justify-center items-center">
        <Pagination
          currentPage={currentPage}
          layout="pagination"
          onPageChange={(page) => {
            setCurrentPage(page);
          }}
          showIcons
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default Requests;
