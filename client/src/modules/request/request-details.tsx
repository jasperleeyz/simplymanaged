"use client";

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IRequest } from "../../shared/model/request.model";
import { Label } from "flowbite-react";
import { capitalizeString } from "../../configs/utils";
import { DATE } from "../../configs/constants";
import BackButton from "../../shared/layout/buttons/back-button";
import ApproveButton from "../../shared/layout/buttons/approve-button";
import RejectButton from "../../shared/layout/buttons/reject-button";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { toast } from 'react-toastify';
import LabeledField from "../../shared/layout/fields/labeled-field";

const RequestDetails = () => {
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  const location = useLocation();
  const navigate = useNavigate();
  const request = location.state.request as IRequest;

  const updateStatus = (req: IRequest, status: string) => {
    req.status = status;
    // TODO: replace with update status API
    const updatedReq = req;
    setGlobalState((prev) => ({
      ...prev,
      requests: prev.requests?.map((r) => (r.id === req.id ? updatedReq : r)),
    }));
    // navigate(".", { state: { request: updatedReq }, replace: true });

    toast.success(`Successfully ${status} request`)
  };

  return (
    <div id="request-details-main">
      <p className="header">Request Details</p>
      <div className="mx-10">
        {request.type !== "swap" && (
          <div className="grid gap-3 grid-cols-2">
            <LabeledField
              id="request-by"
              labelValue="Requested By"
              value={request.createdBy}
            />
            <LabeledField
              id="request-date"
              labelValue="Request Date"
              value={request.createdDate.toLocaleDateString()}
            />
            <LabeledField
              id="request-type"
              labelValue="Request Type"
              value={capitalizeString(request.type)}
            />
            <LabeledField
              id="request-status"
              labelValue="Request Status"
              value={capitalizeString(request.status)}
            />
            {request.type === "shift" && (
              <>
                <LabeledField
                  id="request-shift-date"
                  labelValue="Shift Date"
                  value={request.bidRequest?.startDate.toLocaleDateString(
                    DATE.LANGUAGE
                  )}
                />
                <LabeledField
                  id="request-shift-period"
                  labelValue="Shift"
                  value={request.bidRequest?.shift}
                />
              </>
            )}
            {request.type === "leave" && (
              <>
                <LabeledField
                  id="request-leave-type"
                  labelValue="Leave Type"
                  value={request.leaveRequest?.type}
                />
                <LabeledField
                  id="request-leave-half-day"
                  labelValue="Is Half Day?"
                  value={request.leaveRequest?.isHalfDay ? "Yes" : "No"}
                />
                <LabeledField
                  id="request-leave-from"
                  labelValue="From"
                  value={request.leaveRequest?.startDate.toLocaleDateString(
                    DATE.LANGUAGE,
                    DATE.DDMMYYYY_HHMM_A_OPTION
                  )}
                />
                <LabeledField
                  id="request-leave-to"
                  labelValue="To"
                  value={request.leaveRequest?.endDate.toLocaleDateString(
                    DATE.LANGUAGE,
                    DATE.DDMMYYYY_HHMM_A_OPTION
                  )}
                />
                {request.leaveRequest?.remarks ? (
                  <LabeledField
                    id="request-leave-reason"
                    labelValue="Reason"
                    value={request.leaveRequest?.remarks}
                  />
                ) : null}
              </>
            )}
            {!request.updatedBy && (
              <>
                <LabeledField
                  id="request-updated-by"
                  labelValue="Updated By"
                  value={request.updatedBy}
                />
                <LabeledField
                  id="request-updated-date"
                  labelValue="Updated Date"
                  value={request.updatedDate.toLocaleDateString(DATE.LANGUAGE)}
                />
              </>
            )}
          </div>
        )}
        {request.type === "swap" && <SwapRequestDetails request={request} />}
        <div className="flex mt-8 gap-3">
          <BackButton size="sm" />
          {request.status === "pending" && (
            <>
              <ApproveButton
                size="sm"
                onClick={() => updateStatus(request, "approved")}
              />
              <RejectButton
                size="sm"
                onClick={() => updateStatus(request, "rejected")}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;


const SwapRequestDetails = ({ request }) => {
  return (
    <div className="grid gap-5">
      <LabeledField
        id="request-swap-requestor"
        labelValue="Requestor"
        value={request.createdBy}
      />
      <LabeledField
        id="request-swap-requestor-shift-date"
        labelValue="Requestor's Shift"
        value={
          request.shiftSwapRequest?.requestorShiftDate.toLocaleDateString(
            DATE.LANGUAGE
          ) +
          `, ${request.shiftSwapRequest?.requestorShiftDate.toLocaleDateString(
            DATE.LANGUAGE,
            { weekday: "long" }
          )}, ` +
          request.shiftSwapRequest?.requestorShift
        }
      />
      <LabeledField
        id="request-swap-requested-shift-date"
        labelValue="Requested Shift"
        value={
          request.shiftSwapRequest?.requestedShiftDate.toLocaleDateString(
            DATE.LANGUAGE
          ) +
          `, ${request.shiftSwapRequest?.requestedShiftDate.toLocaleDateString(
            DATE.LANGUAGE,
            { weekday: "long" }
          )}, ` +
          request.shiftSwapRequest?.requestedShift
        }
      />
      <LabeledField
        id="request-swap-reason"
        labelValue="Reason"
        value={request.shiftSwapRequest?.swapReason}
      />
    </div>
  );
};
