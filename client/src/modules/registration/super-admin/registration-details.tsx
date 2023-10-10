import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../../shared/layout/buttons/back-button";
import { toast } from "react-toastify";
import {
  getRegistrationById,
  updateRegistration,
} from "../../../shared/api/registration.api";
import { IRegistration } from "../../../shared/model/company.model";
import { DATE, PATHS, REGISTRATION_STATUS } from "../../../configs/constants";
import LabeledField from "../../../shared/layout/fields/labeled-field";
import { IApplicationCode } from "../../../shared/model/application.model";
import { getCodesForRegistration } from "../../../shared/api/code.api";
import ApproveButton from "../../../shared/layout/buttons/approve-button";
import RejectButton from "../../../shared/layout/buttons/reject-button";
import moment from "moment";

const RegistrationDetails = () => {
  const id = useParams()?.id;
  const navigate = useNavigate();

  const [registration, setRegistration] = React.useState<
    IRegistration | undefined
  >();
  const [noOfEmployeesCodes, setNoOfEmployeesCodes] = React.useState<
    IApplicationCode[]
  >([]);
  const [industryCodes, setIndustryCodes] = React.useState<IApplicationCode[]>(
    []
  );
  const [loading, setLoading] = React.useState(false);
  const [processing, setProcessing] = React.useState("");

  const updateStatus = (req: IRegistration, status: string) => {
    setLoading(true);
    setProcessing(status);
    updateRegistration({ ...req, approve_status: status })
      .then((res) => {
        toast.success(
          `Registration ${
            status === REGISTRATION_STATUS.APPROVED ? "approved" : "rejected"
          } successfully!`
        );
        setRegistration((prev) => res.data);
      })
      .catch((err) => {
        toast.error(
          `Error ${
            status === REGISTRATION_STATUS.APPROVED ? "approving" : "rejecting"
          } registration`
        );
      })
      .finally(() => {
        setLoading(false);
        setProcessing("");
      });
  };

  React.useEffect(() => {
    Promise.all([
      getRegistrationById(Number(id))
        .then((res) => {
          setRegistration(res.data);
        })
        .catch((err) => {
          toast.error("Error fetching registration details.", { toastId: id });
          navigate(`/${PATHS.REGISTRATION}/${PATHS.VIEW_REGISTRATION}`);
        }),
      getCodesForRegistration()
        .then((res) => {
          setNoOfEmployeesCodes(res.data.no_of_employees);
          setIndustryCodes(res.data.industry);
        })
        .catch((err) => {
          toast.error("Error fetching codes.", { toastId: id });
          navigate(`/${PATHS.REGISTRATION}/${PATHS.VIEW_REGISTRATION}`);
        }),
    ]);
  }, []);

  return (
    <div id="registration-details">
      <p className="header">Registration Details</p>
      <div className="grid md:grid-cols-2 md:gap-3">
        <LabeledField
          id="registration-company-name"
          labelValue="Company Name"
          value={registration?.company_name}
        />
        <LabeledField
          id="registration-company-uen"
          labelValue="Company UEN"
          value={registration?.uen_id}
        />
        <LabeledField
          id="registration-company-industry"
          labelValue="Industry"
          value={
            industryCodes.find((code) => code.code === registration?.industry)
              ?.description || registration?.industry
          }
        />
        <LabeledField
          id="registration-company-no-of-employees"
          labelValue="No. of Employees"
          value={
            noOfEmployeesCodes.find(
              (code) => Number(code.code) === registration?.no_of_employees
            )?.description || registration?.no_of_employees
          }
        />
        <LabeledField
          id="registration-company-contact-person"
          labelValue="Contact Person"
          value={registration?.registrant_name}
        />
        <LabeledField
          id="registration-company-contact-no"
          labelValue="Contact No."
          value={registration?.contact_no}
        />
        <LabeledField
          id="registration-company-email"
          labelValue="Contact Email"
          value={registration?.email}
        />
        <LabeledField
          id="registration-company-address"
          labelValue="Address"
          value={registration?.address}
        />
        <LabeledField
          id="registration-status"
          labelValue="Status"
          value={
            REGISTRATION_STATUS[registration?.approve_status || ""] ||
            registration?.approve_status
          }
        />
        <LabeledField
          id="registration-registered-date"
          labelValue="Registered Date"
          value={moment(registration?.created_date).format(
            DATE.MOMENT_DDMMYYYY
          )}
        />
      </div>
      <div className="flex mt-8 gap-3">
        <BackButton size="sm" disabled={loading} />
        {registration?.approve_status === REGISTRATION_STATUS.PENDING && (
          <>
            <ApproveButton
              size="sm"
              disabled={loading}
              isProcessing={processing === REGISTRATION_STATUS.APPROVED}
              onClick={() =>
                updateStatus(registration, REGISTRATION_STATUS.APPROVED)
              }
            />
            <RejectButton
              size="sm"
              disabled={loading}
              isProcessing={processing === REGISTRATION_STATUS.REJECTED}
              onClick={() =>
                updateStatus(registration, REGISTRATION_STATUS.REJECTED)
              }
            />
          </>
        )}
      </div>
    </div>
  );
};

export default RegistrationDetails;
