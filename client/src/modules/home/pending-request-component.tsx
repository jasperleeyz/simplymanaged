import React from "react";
import { Request } from "../../shared/model/request.model";
import { capitalizeString } from "../../configs/utils";

interface IProps {
  requests: Request[];
}

const PendingRequestComponent = ({ requests }: IProps) => {
  return (
    <div>
      <div className="grid grid-cols-2">
        <p className="font-semibold">Type</p>
        <p className="font-semibold">Requestor</p>
      </div>
      {requests.map((req, idx) => (
        <div className="grid grid-cols-2 mt-2">
          <p>{capitalizeString(req.type)}</p>
          <p>{req.createdBy}</p>
        </div>
      ))}
    </div>
  );
};

export default PendingRequestComponent;
