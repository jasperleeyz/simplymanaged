"use client";

import { Button, Pagination, Table } from "flowbite-react";
import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { Request } from "../../shared/model/request.model";
import { capitalizeString } from "../../configs/utils";
import { DATE, PATHS } from "../../configs/constants";
import { useNavigate } from "react-router-dom";
import ApproveButton from "../../shared/layout/buttons/approve-button";
import RejectButton from "../../shared/layout/buttons/reject-button";

const Requests = () => {
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  // const [requests, setRequests] = React.useState<Request[]>([]);
  const requests = globalState?.requests.filter((req) => {
    if (globalState.user?.role === "E") {
      return req.type === "swap" ? req : null;
    } else {
      return req.type !== "swap" ? req : null;
    }
  });
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState(1);

  const updateStatus = (req: Request, status: string) => {
    // TODO: replace with api call for updating status
    req.status = status;
    setGlobalState((prev) => ({
      ...prev,
      requests: prev.requests.map((r) => (r.id === req.id ? req : r)),
    }));
  };

  // load initial request data TODO: replace with API call
  React.useEffect(() => {}, []);

  return (
    <div id="request-main">
      <p className="header">Requests</p>
      <div className="overflow-x-auto">
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
                    <Table.Cell>{request.createdBy}</Table.Cell>
                    <Table.Cell>
                      {request.type === "leave" ? (
                        <>
                          <p>{`${request.leaveRequest?.leaveDateFrom.toLocaleDateString(
                            DATE.LANGUAGE,
                            DATE.DDMMYYYY_HHMM_A_OPTION
                          )}`}</p>
                          <p className="my-2">to</p>
                          <p>{`${request.leaveRequest?.leaveDateTo.toLocaleTimeString(
                            DATE.LANGUAGE,
                            DATE.DDMMYYYY_HHMM_A_OPTION
                          )}`}</p>
                        </>
                      ) : request.type === "shift" ? (
                        <p>
                          {`${request.shiftRequest?.shiftDate.toLocaleDateString()}, ${
                            request.shiftRequest?.shift
                          } Shift`}
                        </p>
                      ) : (
                        <>
                          <p>
                            {`His/Her schedule: ${request.shiftSwapRequest?.requestorShiftDate.toLocaleDateString(
                              DATE.LANGUAGE
                            )}, ${request.shiftSwapRequest?.requestorShiftDate.toLocaleDateString(
                              DATE.LANGUAGE,
                              { weekday: "long" }
                            )},
                            ${request.shiftSwapRequest?.requestorShift}
                          `}
                          </p>
                          <p>{`Your schedule: ${request.shiftSwapRequest?.requestedShiftDate.toLocaleDateString(
                            DATE.LANGUAGE
                          )}, ${request.shiftSwapRequest?.requestedShiftDate.toLocaleDateString(
                            DATE.LANGUAGE,
                            { weekday: "long" }
                          )},
                            ${request.shiftSwapRequest?.requestedShift}
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
                              onClick={() => updateStatus(request, "approve")}
                            />
                            <RejectButton
                              size="sm"
                              onClick={() => updateStatus(request, "rejected")}
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
        <div className="flex mt-4 text-center justify-center items-center">
          <Pagination
            currentPage={1}
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
            showIcons
            totalPages={1}
          />
        </div>
      </div>
    </div>
  );
};

export default Requests;
