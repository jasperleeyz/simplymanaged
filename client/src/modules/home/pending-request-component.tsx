import React from "react";
import { IRequest } from "../../shared/model/request.model";
import { capitalizeString } from "../../configs/utils";
import moment from "moment";
import { DATE } from "../../configs/constants";

interface IProps {
  requests: IRequest[];
  personalRequest?: boolean;
}

const PendingRequestComponent = ({ requests, personalRequest }: IProps) => {
  return (
    <div>
      <div className="grid grid-cols-2">
        <p className="font-semibold">Type</p>
        <p className="font-semibold">
          {personalRequest ? `Date of Request` : `Requester`}
        </p>
      </div>
      {requests.map((req, idx) => (
        <div key={idx} className="grid grid-cols-2 mt-2">
          <p>{capitalizeString(req.type)}</p>
          {personalRequest ? (
            <p>{moment(req.created_date).format(DATE.MOMENT_DDMMYYYY)}</p>
          ) : (
            <p>{req.created_by}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PendingRequestComponent;
