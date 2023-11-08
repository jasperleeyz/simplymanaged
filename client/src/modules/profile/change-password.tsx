import { Button, Checkbox, Label } from "flowbite-react";
import LabeledInputText from "../../shared/layout/form/labeled-text-input";
import { toast } from "react-toastify";
import { Formik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import React from "react";
import { changePassword } from "../../shared/api/user.api";

const ChangePasswordSchema = Yup.object().shape({
  current_password: Yup.string().required("Field is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .notOneOf(
      [Yup.ref("current_password"), undefined],
      "New password must be different from current password"
    )
    .required("Field is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password"), undefined], "Passwords must match")
    .required("Field is required"),
});

const ChangePassword = () => {
  const navigate = useNavigate();

  return (
    <div>
      <p className="header">Change Password</p>
      <div className="md:w-1/2 md:mx-auto">
        <Formik
          initialValues={{
            current_password: "",
            password: "",
            confirm_password: "",
            show_password: false,
          }}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setSubmitting(true);
            try {
              await changePassword({
                current_password: btoa(values.current_password),
                password: btoa(values.password),
                confirm_password: btoa(values.confirm_password),
              })
                .then(() => {
                  toast.success("Password changed successfully.");
                  resetForm();
                })
                .catch((err) => {
                  toast.error(err);
                });
            } catch (err) {
              toast.error("Error encountered. Please try again later.");
            } finally {
              setSubmitting(false);
            }
          }}
          validationSchema={ChangePasswordSchema}
        >
          {(props) => (
            <form onSubmit={props.handleSubmit}>
              <LabeledInputText
                id="current-password"
                name="current_password"
                labelValue="Current Password"
                type={props.values.show_password ? "text" : "password"}
                value={props.values.current_password}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.current_password &&
                  props.touched.current_password
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.current_password &&
                  props.touched.current_password ? (
                    <>{props.errors.current_password}</>
                  ) : null
                }
              />
              <LabeledInputText
                id="password"
                name="password"
                labelValue="New Password"
                type={props.values.show_password ? "text" : "password"}
                value={props.values.password}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.password && props.touched.password
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.password && props.touched.password ? (
                    <>{props.errors.password}</>
                  ) : null
                }
              />
              <LabeledInputText
                id="confirm-password"
                name="confirm_password"
                labelValue="Confirm Password"
                type={props.values.show_password ? "text" : "password"}
                value={props.values.confirm_password}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.confirm_password &&
                  props.touched.confirm_password
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.confirm_password &&
                  props.touched.confirm_password ? (
                    <>{props.errors.confirm_password}</>
                  ) : null
                }
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-password"
                  name="show_password"
                  onChange={props.handleChange}
                  checked={props.values.show_password}
                />
                <Label htmlFor="show-password">Show password</Label>
              </div>
              <div className="flex items-center mt-8 justify-end gap-3">
                <Button
                  type="button"
                  size="sm"
                  color="light"
                  disabled={props.isSubmitting}
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isProcessing={props.isSubmitting}
                  disabled={props.isSubmitting}
                >
                  Submit
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ChangePassword;
