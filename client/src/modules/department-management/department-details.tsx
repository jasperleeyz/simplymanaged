import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { DATE, PATHS } from "../../configs/constants";
import BackButton from "../../shared/layout/buttons/back-button";
import EditButton from "../../shared/layout/buttons/edit-button";
import DeactivateButton from "../../shared/layout/buttons/deactivate-button";
import LabeledField from "../../shared/layout/fields/labeled-field";
import moment from "moment";
import ActivateButton from "../../shared/layout/buttons/activate-button";
import { IDepartment } from "../../shared/model/company.model";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { getAllDepartments } from "../../shared/api/department.api";
import { Avatar, Button, Modal } from "flowbite-react";

const DepartmentDetails = () => {
  const id = useParams()?.id;
  const navigate = useNavigate();
  const logged_in_user =
    React.useContext(GlobalStateContext)?.globalState?.user;

  const [department, setDepartment] = React.useState<IDepartment | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    getAllDepartments(
      logged_in_user?.company_id || 0,
      undefined,
      undefined,
      undefined,
      `equals(id,${id})`
    )
      .then((res) => {
        setDepartment(res.data[0]);
      })
      .catch((err) => {
        toast.error(err, { toastId: id });
        navigate(`/${PATHS.DEPARTMENT}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div id="department-details">
      <p className="header">Department Details</p>
      <div className="grid md:grid-cols-2 md:gap-3">
        <LabeledField
          id="department-name"
          labelValue="Name"
          value={department?.department_name}
        />
        <LabeledField
          id="department-head"
          labelValue="Department Head"
          value={department?.department_head?.fullname || "N/A"}
        />
        <LabeledField
          id="no-of-employees"
          labelValue="No. of Employees"
          value={department?.employees?.length || 0}
        />
        <LabeledField
          id="updated-date"
          labelValue="Last Updated Date"
          value={moment(department?.updated_date).format(DATE.MOMENT_DDMMYYYY)}
        />
        <LabeledField
          id="updated-by"
          labelValue="Last Updated By"
          value={department?.updated_by}
        />
      </div>
      <div className="flex mt-8 gap-3">
        <BackButton size="sm" disabled={loading} />
        <Button
          size="sm"
            disabled={loading || !department?.employees?.length}
          onClick={() => {
            setShowModal((prev) => true);
          }}
        >
          View Department Employees
        </Button>
        <EditButton
          size="sm"
          disabled={loading}
          onClick={() => {
            navigate(`/${PATHS.DEPARTMENT}/${PATHS.EDIT_DEPARTMENT}/${id}`);
          }}
        />
        <Modal show={showModal} dismissible onClose={() => setShowModal((prev) => false)}>
          <Modal.Header>
            <p className="text-lg">Employees</p>
          </Modal.Header>
          <Modal.Body>
            <div>
              {department?.employees?.map((employee, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 md:flex items-center border border-gray-300 rounded-md p-3 mb-3"
                >
                  <Avatar
                    size="md"
                    className="m-0 mr-3"
                    img={employee.profile_image}
                  />
                  <div className="md:flex">
                    <p className="font-bold md:mr-3">{employee.fullname}</p>
                    <p className="md:mr-3">{employee.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default DepartmentDetails;
