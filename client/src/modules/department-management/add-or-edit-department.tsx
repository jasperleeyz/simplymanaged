import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IDepartment } from "../../shared/model/company.model";
import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { PATHS, ROLES } from "../../configs/constants";
import { getAllEmployees } from "../../shared/api/user.api";
import IUser from "../../shared/model/user.model";
import { createUpdateDepartment, getAllDepartments } from "../../shared/api/department.api";
import { toast } from "react-toastify";
import BackButton from "../../shared/layout/buttons/back-button";
import { Button } from "flowbite-react";
import { Formik } from "formik";
import LabeledSelect from "../../shared/layout/form/labeled-select";
import LabeledTextInput from "../../shared/layout/form/labeled-text-input";
import * as Yup from "yup";

const DepartmentSchema = Yup.object().shape({
  department_name: Yup.string().required("Field is required"),
  department_head_id: Yup.number().notRequired(),
});

const AddOrEditDepartment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = useParams()?.id;
  const logged_in_user =
    React.useContext(GlobalStateContext)?.globalState?.user;

  const [managerList, setManagerList] = React.useState<IUser[]>([]);
  const [initialValues, setInitialValues] = React.useState<IDepartment>({
    id: 0,
    company_id: logged_in_user?.company_id || 0,
    department_name: "",
    department_head_id: 0,
    department_head: {} as any,
  });

  React.useEffect(() => {
    Promise.all([
      getAllEmployees(
        logged_in_user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        `equals(role,${ROLES.MANAGER})`
      )
        .then((res) => {
          setManagerList(res.data);
        })
        .catch((err) => {
          toast.error("Error encountered. Please try again later");
        }),
    ]);

    if (id) {
      // get department by id
      getAllDepartments(
        logged_in_user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        `equals(id,${id})`
      )
        .then((res) => {
          setInitialValues(res.data[0]);
        })
        .catch((err) => {
          toast.error(err, { toastId: id });
          navigate(`/${PATHS.DEPARTMENT}`);
        });
    }
  }, []);

  return (
    <div>
      <p className="header">{`${!id ? "Add" : "Edit"} Department`}</p>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          try {
            await createUpdateDepartment(values).then(() => {
              toast.success(`Department ${!id ? "created" : "updated"} successfully`);
              navigate(`..`);
            });
          } catch (err) {
            toast.error(
              `Error ${
                !id ? "creating new" : "updating"
              } department. Please try again later.`
            );
          } finally {
            setSubmitting(false);
          }
        }}
        validationSchema={DepartmentSchema}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit} className="md:w-1/2 mx-auto">
            <div>
              <LabeledTextInput
                id="department-name"
                name="department_name"
                labelValue="Name"
                value={props.values.department_name?.toLocaleUpperCase()}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.department_name && props.touched.department_name
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.department_name &&
                  props.touched.department_name ? (
                    <>{props.errors.department_name}</>
                  ) : null
                }
              />
              <LabeledSelect
                id="department-head"
                name="department_head_id"
                labelValue="Department Head"
                value={props.values.department_head_id}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.department_head_id &&
                  props.touched.department_head_id
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.department_head_id &&
                  props.touched.department_head_id ? (
                    <>{props.errors.department_head_id}</>
                  ) : null
                }
              >
                <option value="" />
                {managerList.map((emp, idx) => {
                  return (
                    <option key={idx} value={emp.id}>
                      {emp.fullname}
                    </option>
                  );
                })}
              </LabeledSelect>
            </div>
            <div className="flex justify-end mt-12 gap-3">
              <BackButton size="sm" color="light" />
              <Button
                type="submit"
                size="sm"
                disabled={props.isSubmitting}
                isProcessing={props.isSubmitting}
              >
                Submit
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default AddOrEditDepartment;
