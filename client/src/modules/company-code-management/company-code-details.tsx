import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { CODE_STATUS, DATE, PATHS } from "../../configs/constants";
import BackButton from "../../shared/layout/buttons/back-button";
import EditButton from "../../shared/layout/buttons/edit-button";
import DeactivateButton from "../../shared/layout/buttons/deactivate-button";
import LabeledField from "../../shared/layout/fields/labeled-field";
import moment from "moment";
import ActivateButton from "../../shared/layout/buttons/activate-button";
import { ICompanyCode } from "../../shared/model/company.model";
import { createUpdateCompanyCode, getAllCompanyCodes } from "../../shared/api/company-code.api";
import { GlobalStateContext } from "../../configs/global-state-provider";

const CompanyCodeDetails = () => {
  const id = useParams()?.id;
  const navigate = useNavigate();
  const logged_in_user = React.useContext(GlobalStateContext)?.globalState?.user;

  const [code, setCode] = React.useState<ICompanyCode | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState(false);

  const updateStatus = (c: ICompanyCode, status: string) => {
    setLoading(true);
    createUpdateCompanyCode({ ...c, status })
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
      })
      .finally(() => {
        setLoading(false);
      });
  };

  React.useEffect(() => {
    getAllCompanyCodes(
        logged_in_user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        `equals(id,${id})`)
      .then((res) => {
        setCode(res.data[0]);
      })
      .catch((err) => {
        toast.error(err, { toastId: id });
        navigate(`/${PATHS.COMPANY_CODE}`);
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
        <BackButton size="sm" disabled={loading}/>
        <EditButton
          size="sm"
          disabled={loading}
          onClick={() => {
            navigate(`/${PATHS.COMPANY_CODE}/${PATHS.EDIT_COMPANY_CODE}/${id}`);
          }}
        />
        {code?.status === CODE_STATUS.ACTIVE && (
          <DeactivateButton
            size="sm"
            disabled={loading}
            isProcessing={loading}
            onClick={() => updateStatus(code, CODE_STATUS.INACTIVE)}
          />
        )}
        {code?.status === CODE_STATUS.INACTIVE && (
          <ActivateButton
            size="sm"
            disabled={loading}
            isProcessing={loading}
            onClick={() => updateStatus(code, CODE_STATUS.ACTIVE)}
          />
        )}
      </div>
    </div>
  );
};

export default CompanyCodeDetails;
