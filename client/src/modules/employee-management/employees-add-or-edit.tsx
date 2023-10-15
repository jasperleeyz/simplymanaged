"use client";

import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Avatar, Button, FileInput, Label } from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";
import { MAX_PROFILE_IMAGE_SIZE, PATHS } from "../../configs/constants";
import LabeledTextInput from "../../shared/layout/form/labeled-text-input";
import LabeledSelect from "../../shared/layout/form/labeled-select";
import { toast } from "react-toastify";
import BackButton from "../../shared/layout/buttons/back-button";
import { ICompanyCode } from "../../shared/model/company.model";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { addEmployee, getAllEmployees } from "../../shared/api/user.api";
import { getAllCompanyCodes } from "../../shared/api/company-code.api";
import IUser from "../../shared/model/user.model";

const UserSchema = (
  roleList: ICompanyCode[],
  positionList: ICompanyCode[],
  employmentTypeList: ICompanyCode[]
) =>
  Yup.object().shape({
    fullname: Yup.string().required("Field is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Field is required"),
    contact_no: Yup.string()
      .matches(/^\d{8}$/, "Contact number must be 8 digits")
      .required("Field is required"),
    role: Yup.string()
      .test("within-list", "Invalid role", (value) =>
        roleList.find((role) => role.code === value) ? true : false
      )
      .required("Field is required"),
    position: Yup.string()
      .test("within-list", "Invalid position", (value) =>
        positionList.find((position) => position.code === value) ? true : false
      )
      .required("Field is required"),
    status: Yup.string().required("Field is required"),
    employment_details: Yup.object().shape({
      employment_type: Yup.string()
        .test("within-list", "Invalid employment type", (value) =>
          employmentTypeList.find(
            (employmentType) => employmentType.code === value
          )
            ? true
            : false
        )
        .required("Field is required")
        .nonNullable(),
      working_hours: Yup.string()
        .matches(
          /^\d{1,2}(\.\d{1,2})?$/,
          "Please enter valid number (eg. 42, 42.5)"
        )
        .required("Field is required")
        .nonNullable(),
    }),
  });

const AddOrEditUser = () => {
  const loggedin_user = React.useContext(GlobalStateContext).globalState?.user;
  const navigate = useNavigate();
  const id = useParams()?.id;

  const [codeList, setCodeList] = React.useState<ICompanyCode[]>([]);
  const [initialValues, setInitialValues] = React.useState<IUser>({
    id: 0,
    company_id: loggedin_user?.company_id || 0,
    fullname: "",
    email: "",
    contact_no: "",
    role: "",
    position: "",
    status: "A",
    profile_image: undefined,
    employment_details: {
      user_id: 0,
      user_company_id: loggedin_user?.company_id || 0,
      employment_type: "",
      working_hours: "",
    },
  });

  React.useEffect(() => {
    getAllCompanyCodes(
      loggedin_user?.company_id || 0,
      undefined,
      undefined,
      undefined,
      "in(code_type,[position,role,employment_type])"
    )
      .then((res) => {
        setCodeList(res.data);
      })
      .catch((err) => {
        toast.error("Error encountered. Please try again later");
      });

    if (id) {
      getAllEmployees(
        loggedin_user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        `equals(id,${id})`
      )
        .then((res) => {
          if(res.data[0].employment_details === null) {
            res.data[0].employment_details = {
              user_id: res.data[0].id,
              user_company_id: res.data[0].company_id,
              employment_type: "",
              working_hours: "",
            };
          }
          setInitialValues(res.data[0]);
        })
        .catch((err) => {
          toast.error(err, { toastId: id });
          navigate(`/${PATHS.CODE}`);
        });
    }
  }, []);

  return (
    <div>
      <p className="header">{`${!id ? "Add" : "Edit"} Employee`}</p>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          try {
            await addEmployee(values).then(() => {
              toast.success(
                `Employee ${!id ? "created" : "details updated"} successfully`
              );
              navigate(`..`);
            });
          } catch (err) {
            toast.error(
              `Error ${
                !id ? "creating new" : "updating"
              } employee. Please try again later.`
            );
          } finally {
            setSubmitting(false);
          }
        }}
        validationSchema={UserSchema(
          codeList.filter((code) => code.code_type === "role") || [],
          codeList.filter((code) => code.code_type === "position") || [],
          codeList.filter((code) => code.code_type === "employment_type") || []
        )}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit} className="md:w-1/2 mx-auto">
            <div>
              <div className="mb-2">
                <Label htmlFor="profile-image">Profile Image</Label>
                <FileInput
                  id="profile-image"
                  name="profile_image"
                  accept=".png,.jpg,.jpeg"
                  onBlur={props.handleBlur}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      // validate file size
                      if (e.target.files[0].size > MAX_PROFILE_IMAGE_SIZE) {
                        props.setFieldError(
                          "profile_image",
                          `File size should not exceed ${
                            MAX_PROFILE_IMAGE_SIZE / (1024 * 1024)
                          }MB`
                        );
                        return;
                      }

                      if (
                        !e.target.files[0].type.match(/image\/(png|jpg|jpeg)/)
                      ) {
                        props.setFieldError(
                          "profile_image",
                          `File type should be png, jpg or jpeg`
                        );
                        return;
                      }

                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        props.setFieldValue(
                          "profile_image",
                          evt.target?.result
                        );
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                  color={
                    props.errors.profile_image && props.touched.profile_image
                      ? "failure"
                      : "gray"
                  }
                  helperText={
                    props.errors.profile_image &&
                    props.touched.profile_image ? (
                      <>{props.errors.profile_image}</>
                    ) : (
                      <>
                        Only png, jpg and jpeg files with a size limit of 10MB
                        are allowed.
                      </>
                    )
                  }
                />
                {props.values.profile_image && (
                  <Avatar
                    rounded
                    size={"xl"}
                    className="mt-2"
                    img={props.values.profile_image}
                  />
                )}
              </div>
              <LabeledTextInput
                id="fullname"
                name="fullname"
                labelValue="Full Name"
                value={props.values.fullname}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.fullname && props.touched.fullname
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.fullname && props.touched.fullname ? (
                    <>{props.errors.fullname}</>
                  ) : null
                }
              />
              <LabeledTextInput
                id="email"
                name="email"
                labelValue="E-mail"
                value={props.values.email}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.email && props.touched.email ? "failure" : "gray"
                }
                helperText={
                  props.errors.email && props.touched.email ? (
                    <>{props.errors.email}</>
                  ) : null
                }
              />
              <LabeledTextInput
                id="contact-no"
                name="contact_no"
                labelValue="Contact No."
                value={props.values.contact_no}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.contact_no && props.touched.contact_no
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.contact_no && props.touched.contact_no ? (
                    <>{props.errors.contact_no}</>
                  ) : null
                }
              />
              <LabeledSelect
                id="role"
                name="role"
                labelValue="Role"
                value={props.values.role}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.role && props.touched.role ? "failure" : "gray"
                }
                helperText={
                  props.errors.role && props.touched.role ? (
                    <>{props.errors.role}</>
                  ) : null
                }
              >
                <option value="" />
                {codeList
                  .filter((code) => code.code_type === "role")
                  .map((code, idx) => {
                    return (
                      <option key={idx} value={code.code}>
                        {code.description}
                      </option>
                    );
                  })}
              </LabeledSelect>
              <LabeledSelect
                id="position"
                name="position"
                labelValue="Position"
                value={props.values.position}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.position && props.touched.position
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.position && props.touched.position ? (
                    <>{props.errors.position}</>
                  ) : null
                }
              >
                <option value="" />
                {codeList
                  .filter((code) => code.code_type === "position")
                  .map((code, idx) => {
                    return (
                      <option key={idx} value={code.code}>
                        {code.description}
                      </option>
                    );
                  })}
                <option value="other">Other</option>
              </LabeledSelect>
              <LabeledSelect
                id="employment-type"
                name="employment_details.employment_type"
                labelValue="Employment Type"
                value={props.values.employment_details?.employment_type}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.employment_details &&
                  props.errors.employment_details["employment_type"] &&
                  props.touched.employment_details &&
                  props.touched.employment_details["employment_type"]
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.employment_details &&
                  props.errors.employment_details["employment_type"] &&
                  props.touched.employment_details &&
                  props.touched.employment_details["employment_type"] ? (
                    <>{props.errors.employment_details["employment_type"]}</>
                  ) : null
                }
              >
                <option value="" />
                {codeList
                  .filter((code) => code.code_type === "employment_type")
                  .map((code, idx) => {
                    return (
                      <option key={idx} value={code.code}>
                        {code.description}
                      </option>
                    );
                  })}
                <option value="other">Other</option>
              </LabeledSelect>
              <LabeledTextInput
                id="working-hours"
                name="employment_details.working_hours"
                labelValue="Working Hours"
                value={props.values.employment_details?.working_hours}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.employment_details &&
                  props.errors.employment_details["working_hours"] &&
                  props.touched.employment_details &&
                  props.touched.employment_details["working_hours"]
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.employment_details &&
                  props.errors.employment_details["working_hours"] &&
                  props.touched.employment_details &&
                  props.touched.employment_details["working_hours"] ? (
                    <>{props.errors.employment_details["working_hours"]}</>
                  ) : (
                    <>Working hours per week</>
                  )
                }
              />
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

export default AddOrEditUser;
