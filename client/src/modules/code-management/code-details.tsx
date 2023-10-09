import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createUpdateCodes, getCodeById } from "../../shared/api/code.api";
import { IApplicationCode } from "../../shared/model/application.model";
import { toast } from "react-toastify";
import { CODE_STATUS, DATE, PATHS } from "../../configs/constants";
import BackButton from "../../shared/layout/buttons/back-button";
import EditButton from "../../shared/layout/buttons/edit-button";
import DeactivateButton from "../../shared/layout/buttons/deactivate-button";
import LabeledField from "../../shared/layout/fields/labeled-field";
import moment from "moment";
import ActivateButton from "../../shared/layout/buttons/activate-button";

const CodeDetails = () => {
  const id = useParams()?.id;
  const navigate = useNavigate();

  const [code, setCode] = React.useState<IApplicationCode | undefined>(
    undefined
  );

  const updateStatus = (c: IApplicationCode, status: string) => {
    createUpdateCodes({ ...c, status })
      .then((res) => {
        toast.success(
          `Code ${
            status === CODE_STATUS.ACTIVE ? "activated" : "deactivated"
          } successfully!`
        );
        setCode((prev) => res.data);
      })
      .catch((err) => {
        toast.error(
          `Error ${
            status === CODE_STATUS.ACTIVE ? "activating" : "deactivating"
          } code`
        );
      });
  };

  React.useEffect(() => {
    getCodeById(Number(id))
      .then((res) => {
        setCode(res.data);
      })
      .catch((err) => {
        toast.error(err, { toastId: id });
        navigate(`/${PATHS.CODE}`);
      });
  }, []);

  return (
    <div id="code-details">
      <p className="header">Code Details</p>
      <div className="grid md:grid-cols-2 md:gap-3">
        <LabeledField
          id="code-type"
          labelValue="Code Type"
          value={code?.code_type}
        />
        <LabeledField id="code" labelValue="Code" value={code?.code} />
        <LabeledField
          id="description"
          labelValue="Description"
          value={code?.description}
        />
        <LabeledField
          id="status"
          labelValue="Status"
          value={CODE_STATUS[code?.status || ""] || code?.status}
        />
        <LabeledField
          id="updated-date"
          labelValue="Last Updated Date"
          value={moment(code?.updated_date).format(DATE.MOMENT_DDMMYYYY)}
        />
        <LabeledField
          id="updated-by"
          labelValue="Last Updated By"
          value={code?.updated_by}
        />
      </div>
      <div className="flex mt-8 gap-3">
        <BackButton size="sm" />
        <EditButton
          size="sm"
          onClick={() => {
            navigate(`/${PATHS.CODE}/${PATHS.EDIT_CODE}/${id}`);
          }}
        />
        {code?.status === CODE_STATUS.ACTIVE && (
          <DeactivateButton
            size="sm"
            onClick={() => updateStatus(code, CODE_STATUS.INACTIVE)}
          />
        )}
        {code?.status === CODE_STATUS.INACTIVE && (
          <ActivateButton
            size="sm"
            onClick={() => updateStatus(code, CODE_STATUS.ACTIVE)}
          />
        )}
      </div>
    </div>
  );
};

export default CodeDetails;
