"use client";

import React from "react";
import { useParams } from "react-router-dom";
import { IRequest } from "../../shared/model/request.model";
import { DATE, REQUEST } from "../../configs/constants";
import BackButton from "../../shared/layout/buttons/back-button";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { toast } from "react-toastify";
import LabeledField from "../../shared/layout/fields/labeled-field";
import { getPersonalRequestById } from "../../shared/api/request.api";
import moment from "moment";
import { ICompanyCode } from "../../shared/model/company.model";
import { getAllCompanyCodes } from "../../shared/api/company-code.api";
import { Label } from "flowbite-react";
import IUser from "../../shared/model/user.model";
import { getDepartmentHeadByDepartmentId } from "../../shared/api/department.api";

const PersonalRequestDetails = () => {
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  const request_id = useParams().id;
  const [request, setRequest] = React.useState<IRequest>({} as IRequest);
  const [leaveTypeList, setLeaveTypeList] = React.useState<ICompanyCode[]>([]);
  const [departmentHead, setDepartmentHead] = React.useState<IUser>(
    {} as IUser
  );

  React.useEffect(() => {
    Promise.all([
      getPersonalRequestById(Number(request_id)).then((res) => {
        setRequest(res.data);
      }),
      getAllCompanyCodes(
        globalState?.user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        "equals(code_type,leave_type)"
      ).then((res) => {
        setLeaveTypeList(res.data);
      }),
      getDepartmentHeadByDepartmentId(
        globalState?.user?.department_id || 0
      ).then((res) => {
        setDepartmentHead(res.data);
      }),
    ]).catch((err) => {
      toast.error("Failed to fetch request details. Please try again later.", {
        toastId: "personal-request-details",
      });
    });
  }, []);

  return (
    <div id="request-details-main">
      <p className="header">Request Details</p>
      <div className="md:mx-10">
        {request?.type?.toUpperCase() !== REQUEST.TYPE.SWAP && (
          <div className="grid gap-3 grid-cols-2">
            <LabeledField
              id="request-by"
              labelValue="Requested By"
              value={request.created_by}
            />
            <LabeledField
              id="request-date"
              labelValue="Request Date"
              value={moment(request.created_date).toDate().toLocaleDateString()}
            />
            <LabeledField
              id="request-type"
              labelValue="Request Type"
              value={request.type}
            />
            <LabeledField
              id="request-status"
              labelValue="Request Status"
              value={REQUEST.STATUS[request.status]}
            />
            {request?.type?.toUpperCase() === REQUEST.TYPE.BID && (
              <>
                <LabeledField
                  id="request-shift-date"
                  labelValue="Shift Date"
                  value={moment(request.bid_request?.start_date)
                    .toDate()
                    .toLocaleDateString(DATE.LANGUAGE)}
                />
                <LabeledField
                  id="request-shift-period"
                  labelValue="Shift"
                  value={request.bid_request?.shift}
                />
              </>
            )}
            {request?.type?.toUpperCase() === REQUEST.TYPE.LEAVE && (
              <>
                <LabeledField
                  id="request-leave-type"
                  labelValue="Leave Type"
                  value={
                    leaveTypeList.find(
                      (code) => code.code === request.leave_request?.type
                    )?.description
                  }
                />
                <LabeledField
                  id="request-leave-half-day"
                  labelValue="Is Half Day?"
                  value={request.leave_request?.half_day}
                />
                <LabeledField
                  id="request-leave-from"
                  labelValue="From"
                  value={moment(request.leave_request?.start_date).format(
                    DATE.MOMENT_DDMMYYYY
                  )}
                />
                <LabeledField
                  id="request-leave-to"
                  labelValue="To"
                  value={moment(request.leave_request?.end_date).format(
                    DATE.MOMENT_DDMMYYYY
                  )}
                />
                <LabeledField
                  id="approving-manager"
                  labelValue="Approving Manager"
                  value={
                    request.status === REQUEST.STATUS.PENDING
                      ? departmentHead?.fullname || "N/A"
                      : request.updated_by
                  }
                />
                {request.leave_request?.remarks ? (
                  <div className="col-span-2">
                    <LabeledField
                      id="request-leave-reason"
                      labelValue="Reason"
                      value={request.leave_request?.remarks}
                    />
                  </div>
                ) : null}
                {request.leave_request?.attachment ? (
                  <div className="col-span-2">
                    <Label value={"Attachment"} />
                    <img
                      src={request.leave_request?.attachment}
                      style={{ maxWidth: "100%", maxHeight: "500px" }}
                    />
                  </div>
                ) : null}
              </>
            )}
            {!request.updated_by && (
              <>
                <LabeledField
                  id="request-updated-by"
                  labelValue="Updated By"
                  value={request.updated_by}
                />
                <LabeledField
                  id="request-updated-date"
                  labelValue="Updated Date"
                  value={moment(request.updated_date)
                    .toDate()
                    .toLocaleDateString(DATE.LANGUAGE)}
                />
              </>
            )}
          </div>
        )}
        {request?.type?.toUpperCase() === REQUEST.TYPE.SWAP && (
          <SwapRequestDetails request={request} />
        )}
        <div className="flex mt-8 gap-3">
          <BackButton size="sm" />
        </div>
      </div>
    </div>
  );
};

export default PersonalRequestDetails;

interface ISwapRequestDetailsProps {
  request: IRequest;
}

const SwapRequestDetails = ({ request }: ISwapRequestDetailsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <LabeledField
        id="request-swap-requester"
        labelValue="Requester"
        value={request.created_by}
      />
      <LabeledField
        id="request-date"
        labelValue="Request Date"
        value={moment(request.created_date).toDate().toLocaleDateString()}
      />
      <LabeledField
        id="request-type"
        labelValue="Request Type"
        value={request.type}
      />
      <LabeledField
        id="request-status"
        labelValue="Request Status"
        value={REQUEST.STATUS[request.status]}
      />
      <LabeledField
        id="request-swap-requester-shift-date"
        labelValue="Requester's Shift"
        value={
          moment(request.swap_request?.requester_schedule?.start_date)
            .toDate()
            .toLocaleDateString(DATE.LANGUAGE) +
          `, ${moment(
            request.swap_request?.requester_schedule?.start_date
          ).format("dddd")}, ` +
          request.swap_request?.requester_schedule?.shift
        }
      />
      <LabeledField
        id="request-swap-requested-user"
        labelValue="User of Requested Shift"
        value={request.swap_request?.requested_schedule?.user?.fullname}
      />
      <LabeledField
        id="request-swap-requested-shift-date"
        labelValue="Requested Shift"
        value={
          moment(request.swap_request?.requested_schedule?.start_date)
            .toDate()
            .toLocaleDateString(DATE.LANGUAGE) +
          `, ${moment(request.swap_request?.requested_schedule?.start_date)
            .toDate()
            .toLocaleDateString(DATE.LANGUAGE, { weekday: "long" })}, ` +
          request.swap_request?.requested_schedule?.shift
        }
      />
      <LabeledField
        id="request-swap-reason"
        labelValue="Reason"
        value={request.swap_request?.reason}
      />
    </div>
  );
};
