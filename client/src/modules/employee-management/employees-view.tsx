import { useState, useEffect, useContext } from "react";
import { Avatar, Label } from "flowbite-react";
import IUser from "../../shared/model/user.model";
import { PATHS, USER_STATUS } from "../../configs/constants";
import BackButton from "../../shared/layout/buttons/back-button";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { getEmployeeById } from "../../shared/api/user.api";
import LabeledField from "../../shared/layout/fields/labeled-field";
import { getAllCompanyCodes } from "../../shared/api/company-code.api";
import { ICompanyCode } from "../../shared/model/company.model";

const EmployeesViewPage = () => {
  const globalState = useContext(GlobalStateContext)?.globalState;
  const navigate = useNavigate();
  const user_id = useParams().id;
  const [viewEmployee, setViewEmployee] = useState<IUser>({} as IUser);
  const [codeList, setCodeList] = useState<ICompanyCode[]>([]);

  useEffect(() => {
    Promise.all([
      getEmployeeById(Number(user_id)).then((res) => {
        setViewEmployee(res.data);
      }),
      getAllCompanyCodes(
        globalState?.user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        "in(code_type,[employment_type,position])"
      ).then((res) => {
        setCodeList(res.data);
      }),
    ]).catch((err) => {
      toast.error("Failed to fetch employee details. Please try again later.", {
        toastId: "employees-view",
      });
      navigate(`/${PATHS.EMPLOYEES}`);
    });
  }, []);

  return (
    <div>
      <div id="profile-page">
        <div className="flex justify-between">
          <p className="header">Profile</p>
          <BackButton />
        </div>
        <div id="profile-section" className="md:flex">
          <div className="w-full mb-6 md:m-auto md:w-2/5">
            <Avatar
              img={viewEmployee.profile_image ? viewEmployee.profile_image : ""}
              size="xl"
              rounded
              alt="Profile image"
              className="m-auto"
            />
          </div>
          <div id="user-details" className="w-full md:w-3/5">
            <Label htmlFor="user-name" value="Name" />
            <p id="user-name">{viewEmployee.fullname}</p>
            <Label htmlFor="user-email" value="Email" />
            <p id="user-email">{viewEmployee.email}</p>
            <Label htmlFor="user-phone-no" value="Phone No." />
            <p id="user-phone-no">{viewEmployee.contact_no}</p>
          </div>
        </div>
        <hr className="w-full my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <p className="header">Employment Details</p>
        <div
          id="employment-section"
          className="md:px-12 grid grid-cols-2 gap-y-4"
        >
          <LabeledField
            id="employment-id"
            labelValue="Employee ID"
            value={viewEmployee?.id}
          />
          <LabeledField
            id="employment-type"
            labelValue="Employment Type"
            value={
              viewEmployee?.employment_details?.employment_type
                ? codeList.find(
                    (code) =>
                      code.code_type.toLowerCase() === "employment_type" &&
                      code.code ===
                        viewEmployee?.employment_details?.employment_type
                  )?.description
                : "N/A"
            }
          />
          <LabeledField
            id="employment-position"
            labelValue="Position"
            value={
              viewEmployee?.position
                ? codeList.find(
                    (code) =>
                      code.code_type.toLowerCase() === "position" &&
                      code.code === viewEmployee?.position
                  )?.description
                : "N/A"
            }
          />
          <LabeledField
            id="employment-working-hours"
            labelValue="Working Hours"
            value={viewEmployee?.employment_details?.working_hours || "N/A"}
          />
          <LabeledField
            id="account-status"
            labelValue="Account Status"
            value={USER_STATUS[viewEmployee?.status || "N/A"]}
          />
        </div>
        <hr className="w-full my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <p className="header">Preferences</p>
        <div id="preferences-section" className="px-12">
          <LabeledField
            id="preferences-working-days"
            labelValue="Preferred Working Days"
            value={
              viewEmployee?.preferences
                ? viewEmployee?.preferences["working_days"] || "N/A"
                : "N/A"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeesViewPage;
