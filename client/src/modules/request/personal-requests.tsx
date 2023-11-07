import { Button, Spinner, Table } from "flowbite-react";
import React from "react";
import { IRequest } from "../../shared/model/request.model";
import { DATE, PATHS, REQUEST } from "../../configs/constants";
import { useNavigate } from "react-router-dom";
import { getPersonalRequests } from "../../shared/api/request.api";
import { toast } from "react-toastify";
import moment from "moment";

interface IProps {
  page: number;
  sizePerPage: number;
}

const PersonalRequests = ({ page, sizePerPage }: IProps) => {
  const navigate = useNavigate();
  // const user = React.useContext(GlobalStateContext)?.globalState?.user;
  const [personalRequests, setPersonalRequests] = React.useState<IRequest[]>(
    []
  );
  const [requestLoading, setRequestLoading] = React.useState<boolean>(false);
  // const [leaveTypeList, setLeaveTypeList] = React.useState<ICompanyCode[]>([]);

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
                    onClick={() => {
                      navigate(
                        `./${PATHS.VIEW_REQUEST}/personal/${request.id}`
                      );
                    }}
                  >
                    View
                  </Button>
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
