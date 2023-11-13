import { Button, Spinner, Table } from "flowbite-react";
import React from "react";
import { IRequest } from "../../shared/model/request.model";
import { DATE, PATHS, REQUEST } from "../../configs/constants";
import { useNavigate } from "react-router-dom";
import {
  getPersonalRequests,
  updateRequest,
} from "../../shared/api/request.api";
import { toast } from "react-toastify";
import moment from "moment";

interface IProps {
  page: number;
  sizePerPage: number;
  leaveTypeList?: any[];
}

interface ILoading {
  id: number;
  status: string;
}

const PersonalRequests = ({ page, sizePerPage, leaveTypeList }: IProps) => {
  const navigate = useNavigate();
  const [personalRequests, setPersonalRequests] = React.useState<IRequest[]>(
    []
  );
  const [requestLoading, setRequestLoading] = React.useState<boolean>(false);
  const [actionLoading, setActionLoading] = React.useState<ILoading[]>([]);

  const updateStatus = (req: IRequest, status: string) => {
    setActionLoading((prev) => [...prev, { id: req.id, status }]);
    updateRequest({ ...req, status })
      .then((res) => {
        setPersonalRequests((prev) =>
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
        // setRefreshPage(true)
      });
  };

  React.useEffect(() => {
    setRequestLoading(true);
    Promise.all([
      getPersonalRequests(page, sizePerPage, undefined, undefined).then(
        (res) => {
          setPersonalRequests(res.data);
        }
      ),
      // getAllCompanyCodes(
      //   user?.company_id || 0,
      //   undefined,
      //   undefined,
      //   undefined,
      //   "equals(code_type,leave_type)"
      // ).then((res) => {
      //   setLeaveTypeList(res.data);
      // }),
    ])
      .catch((err) => {
        toast.error("Error retrieving requests. Please try again later");
      })
      .finally(() => {
        setRequestLoading(false);
      });
  }, [page, sizePerPage]);

  return (
    <Table striped>
      <Table.Head>
        <Table.HeadCell>Request Type</Table.HeadCell>
        <Table.HeadCell>Details</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
        <Table.HeadCell></Table.HeadCell>
      </Table.Head>
      <Table.Body>
        {requestLoading ? (
          <Table.Row>
            <Table.Cell align="center" colSpan={4}>
              <Spinner />
            </Table.Cell>
          </Table.Row>
        ) : personalRequests && personalRequests.length > 0 ? (
          personalRequests.map((request, idx) => (
            <Table.Row key={idx}>
              <Table.Cell>{request.type}</Table.Cell>
              <Table.Cell>
                {request.type.toUpperCase() === REQUEST.TYPE.LEAVE ? (
                  <>
                    <p>
                      {`${moment(request.leave_request?.start_date).format(
                        DATE.MOMENT_DDMMYYYY
                      )}`}{" "}
                      to{" "}
                      {`${moment(request.leave_request?.end_date).format(
                        DATE.MOMENT_DDMMYYYY
                      )}`}
                    </p>
                    <p>{leaveTypeList?.find((lt) => lt.code === request.leave_request?.type).description}</p>
                    {request.leave_request?.half_day && (
                      <p>{`Half-day?: ${request.leave_request?.half_day}`}</p>
                    )}
                  </>
                ) : request.type.toUpperCase() === REQUEST.TYPE.BID ? (
                  <p>
                    {`${moment(request.bid_request?.start_date).format(
                      DATE.MOMENT_DDMMYYYY
                    )}, ${request.bid_request?.shift} Shift`}
                  </p>
                ) : (
                  <>
                    <p>
                      {`His/Her schedule: ${moment(
                        request.swap_request?.requester_schedule?.start_date
                      ).format(DATE.MOMENT_DDMMYYYY)}, ${moment(
                        request.swap_request?.requester_schedule?.start_date
                      ).format("dddd")},
                            ${request.swap_request?.requester_schedule?.shift}
                          `}
                    </p>
                    <p>{`Your schedule: ${moment(
                      request.swap_request?.requested_schedule?.start_date
                    ).format(DATE.MOMENT_DDMMYYYY)}, ${moment(
                      request.swap_request?.requested_schedule?.start_date
                    ).format("dddd")},
                            ${request.swap_request?.requested_schedule?.shift}
                          `}</p>
                  </>
                )}
              </Table.Cell>
              <Table.Cell>{REQUEST.STATUS[request.status]}</Table.Cell>
              <Table.Cell>
                <div className="flex gap-2 items-center justify-center">
                  <Button
                    size="sm"
                    disabled={
                      actionLoading.find((val) => val.id === request.id) !==
                      undefined
                    }
                    onClick={() => {
                      navigate(
                        `./${PATHS.VIEW_REQUEST}/personal/${request.id}`
                      );
                    }}
                  >
                    View
                  </Button>
                  {request.status === REQUEST.STATUS.PENDING && (
                    <Button
                      size="sm"
                      color="failure"
                      disabled={
                        actionLoading.find((val) => val.id === request.id) !==
                        undefined
                      }
                      isProcessing={
                        actionLoading.find((val) => val.id === request.id) !==
                        undefined
                      }
                      onClick={() => updateStatus(request, REQUEST.STATUS.CANCELLED)}
                    >
                      Cancel
                    </Button>
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
  );
};

export default PersonalRequests;
