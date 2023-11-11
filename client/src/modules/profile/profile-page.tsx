import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { Avatar, Button, Checkbox, Label } from "flowbite-react";
import {
  capitalizeString,
  validName,
  isNumber,
  validEmail,
} from "../../configs/utils";
import { HiPencil, HiSave } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../configs/constants";
import IUser from "../../shared/model/user.model";
import { toast } from "react-toastify";
import { ICompanyCode } from "../../shared/model/company.model";
import { getAllCompanyCodes } from "../../shared/api/company-code.api";
import { updateEmployee } from "../../shared/api/user.api";
import { Formik } from "formik";
import * as Yup from "yup";
import LabeledField from "../../shared/layout/fields/labeled-field";
import LabeledInputText from "../../shared/layout/form/labeled-text-input";

const ProfileSchema = Yup.object().shape({
  fullname: Yup.string()
    .test("only-characters", "Only alphabets are allowed", (val) =>
      validName(val)
    )
    .required("Field is required"),
  email: Yup.string()
    .email("Invalid email address")
    .test("valid-email", "Invalid email address", (val) => validEmail(val))
    .required("Field is required"),
  contact_no: Yup.string()
    .min(8, "Contact No. must be 8 digits")
    .test("is-numbers", "Only numbers are allowed", (val) => isNumber(val))
    .required("Field is required"),
});

const ProfilePage = () => {
  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [editUser, setEditUser] = React.useState<any>({});
  const [codeList, setCodeList] = React.useState<ICompanyCode[]>([]);
  const [isEdit, setIsEdit] = React.useState(() => {
    return location.pathname.endsWith("edit");
  });

  React.useEffect(() => {
    Promise.all([
      getAllCompanyCodes(
        globalState?.user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        `in(code_type,[position,employment_type])`
      ).then((res) => {
        setCodeList(res.data);
      }),
    ]).catch((err) => {
      toast.error("Error retrieving information. Please try again later.", {
        toastId: "profile",
      });
    });
  }, []);

  React.useEffect(() => {
    if (isEdit) {
      setEditUser((prev) => ({
        fullname: globalState?.user?.fullname || "",
        email: globalState?.user?.email || "",
        contact_no: globalState?.user?.contact_no || "",
        preferences: globalState?.user?.preferences?.map((pref) => {
          return {
            module: pref.module,
            preference: pref.preference ? pref.preference.split(",") : [],
          };
        }),
      }));
    }
  }, [isEdit]);

  React.useEffect(() => {
    if(location.pathname.endsWith("edit")) {
      setIsEdit(true);
    } else {
      setIsEdit(false);
    }
  }, [location.pathname]);

  const updatedUser = (values): IUser => {
    return {
      ...globalState?.user,
      fullname: values.fullname.toLocaleUpperCase().trim(),
      email: values.email.toLocaleUpperCase().trim(),
      contact_no: String(values.contact_no).trim(),
      preferences: globalState?.user?.preferences?.map((pref) => {
        pref.preference = values.preferences.find(p => p.module === pref.module)?.preference.join(",") || "";
        return pref;
      }),
    } as IUser;
  };

  return (
    <div id="profile-page">
      <Formik
        initialValues={editUser}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          try {
            await updateEmployee(updatedUser(values))
            .then((res) => {
              setGlobalState((prev) => ({
                ...prev,
                user: res.user,
              }));
              toast.success(`Profile updated successfully`);
              navigate(`/${PATHS.MY_PROFILE}`);
            });
          } catch (err) {
            toast.error(`Error updating profile. Please try again later.`);
          } finally {
            setSubmitting(false);
          }
        }}
        validationSchema={ProfileSchema}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit}>
            <div className="flex justify-between">
              <p className="header">My Profile</p>
              {!isEdit ? (
                <Button
                  size="sm"
                  onClick={() =>
                    navigate(`/${PATHS.MY_PROFILE}/${PATHS.EDIT_PROFILE}`)
                  }
                >
                  <HiPencil className="my-auto mr-2" />
                  <p>Update Profile</p>
                </Button>
              ) : (
                <Button size="sm" type="submit">
                  <HiSave className="my-auto mr-2" />
                  <p>Save</p>
                </Button>
              )}
            </div>
            <div id="profile-section" className="md:flex">
              <div className="w-full mb-6 md:m-auto md:w-2/5">
                <Avatar
                  img={globalState?.user?.profile_image}
                  size="xl"
                  rounded
                  alt="Profile image"
                  className="m-auto"
                />
              </div>
              <div id="user-details" className="w-full md:w-3/5">
                {!isEdit ? (
                  <LabeledField
                    id="fullname"
                    name="fullname"
                    labelValue="Full Name"
                    value={capitalizeString(globalState?.user?.fullname)}
                  />
                ) : (
                  <LabeledInputText
                    id="fullname"
                    name="fullname"
                    labelValue="Full Name"
                    value={props.values.fullname?.toUpperCase() || ""}
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
                )}
                {!isEdit ? (
                  <LabeledField
                    id="email"
                    name="email"
                    labelValue="Email"
                    value={capitalizeString(globalState?.user?.email)}
                  />
                ) : (
                  <LabeledInputText
                    id="email"
                    name="email"
                    labelValue="Email"
                    className="uppercase"
                    value={props.values.email?.toUpperCase() || ""}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    color={
                      props.errors.email && props.touched.email
                        ? "failure"
                        : "gray"
                    }
                    helperText={
                      props.errors.email && props.touched.email ? (
                        <>{props.errors.email}</>
                      ) : null
                    }
                  />
                )}
                {!isEdit ? (
                  <LabeledField
                    id="contact-no"
                    name="contact_no"
                    labelVale="Contact No."
                    value={globalState?.user?.contact_no}
                  />
                ) : (
                  <LabeledInputText
                    id="contact-no"
                    name="contact_no"
                    labelValue="Contact No."
                    value={props.values.contact_no || ""}
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
                )}
              </div>
            </div>
            <hr className="w-full my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
            <p className="header">Employment Details</p>
            <div
              id="employment-section"
              className="md:grid md:grid-cols-2 md:px-12"
            >
              <div>
                <Label htmlFor="employment-id" value="Employee ID" />
                <p id="employment-id">{globalState?.user?.id}</p>
              </div>
              <div>
                <Label htmlFor="employment-type" value="Employment Type" />
                <p id="employment-type">
                  {capitalizeString(
                    codeList.find(
                      (c) =>
                        c.code_type.toLowerCase() === "employment_type" &&
                        c.code ===
                          globalState?.user?.employment_details?.employment_type
                    )?.description ||
                      globalState?.user?.employment_details?.employment_type
                  )}
                </p>
              </div>
              <div>
                <Label htmlFor="employment-position" value="Position" />
                <p id="employment-position">
                  {capitalizeString(
                    codeList.find(
                      (c) =>
                        c.code_type.toLowerCase() === "position" &&
                        c.code === globalState?.user?.position
                    )?.description || globalState?.user?.position
                  )}
                </p>
              </div>
            </div>
            <hr className="w-full my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
            <p className="header">Preferences</p>
            <div id="preferences-section" className="md:px-12">
              {!isEdit
                ? globalState?.user?.preferences?.map((pref, idx) => {
                    return (
                      <div key={idx} className="mb-3">
                        <Label htmlFor={pref.module.toLowerCase()}>
                          {capitalizeString(pref.module.replaceAll("_", " "))}
                        </Label>
                        {getPreferenceCheckboxes(isEdit, idx, {...pref, preference: pref.preference.split(",")}, props)}
                      </div>
                    );
                  })
                : props.values.preferences?.map((pref, idx) => {
                    return (
                      <div key={idx}>
                        <Label htmlFor={pref.module.toLowerCase()}>
                          {capitalizeString(pref.module.replaceAll("_", " "))}
                        </Label>
                        {getPreferenceCheckboxes(isEdit, idx, pref, props)}
                      </div>
                    );
                  })}
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default ProfilePage;

const getPreferenceCheckboxes = (isEdit, index, pref, formikProps) => {
  const getPreferredWorkDaysCheckboxes = () => {
    return (
      <>
      {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, idx) => {
        return (
          <div key={idx}>
            <Checkbox id={day} disabled={!isEdit} value={day} checked={pref.preference?.includes(day)} 
            onChange={(e) => {
              if(e.target.checked) {
                formikProps.setFieldValue(`preferences[${index}].preference`, [...pref.preference, day]);
              } else {
                formikProps.setFieldValue(`preferences[${index}].preference`, (pref.preference as string[]).filter(p => p !== day));
              }
            }}
            />
            <Label className="ml-1" htmlFor={day}>{day?.toUpperCase()}</Label>
          </div>
        );
      })}
      </>
    )
  };

  const getPreferredWorkShiftsCheckboxes = () => {
    return (
      <>
      {["FULL", "AM", "PM"].map((shift, idx) => {
        return (
          <div key={idx}>
            <Checkbox id={shift} disabled={!isEdit} value={shift} checked={pref.preference?.includes(shift)}
            onChange={(e) => {
              if(e.target.checked) {
                formikProps.setFieldValue(`preferences[${index}].preference`, [...pref.preference, shift]);
              } else {
                formikProps.setFieldValue(`preferences[${index}].preference`, (pref.preference as string[]).filter(p => p !== shift));
              }
            }}
            />
            <Label className="ml-1" htmlFor={shift}>{shift?.toUpperCase()}</Label>
          </div>
        );
      })}
      </>
    );
  };

  return (
    <div id={pref.module.toLowerCase()} className="flex flex-wrap gap-3">
      {pref.module === "PREFERRED_WORK_DAYS" ? getPreferredWorkDaysCheckboxes() : getPreferredWorkShiftsCheckboxes()}
    </div>
  );
};
