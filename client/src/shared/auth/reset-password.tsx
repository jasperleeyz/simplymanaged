import React from "react";
import * as Yup from "yup";
import { Formik, setIn } from "formik";
import { Button, Card, Checkbox, Label } from "flowbite-react";
import { HiCheckCircle, HiEye, HiEyeOff, HiXCircle } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LabeledInputText from "../layout/form/labeled-text-input";
import { resetPassword, resetPasswordVerify } from "../api/user.api";
import { atob } from "buffer";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Field is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password"), undefined], "Passwords must match")
    .required("Field is required"),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [success, setSuccess] = React.useState<boolean>(false);
  const [expired, setExpired] = React.useState<boolean>(false);
  const [invalid, setInvalid] = React.useState<boolean>(true);
  const [user, setUser] = React.useState<any>({});

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    if (searchParams.get("t")) {
      const token = searchParams.get("t");
      resetPasswordVerify(token as string)
        .then((res) => {
          history.replaceState(null, "", location.pathname);
          setInvalid((prev) => false);
          setUser((prev) => res.data);
        })
        .catch((err) => {
          if (err === "expired") {
            history.replaceState(null, "", location.pathname);
            setExpired((prev) => true);
          }
          if (err === "invalid") {
            history.replaceState(null, "", location.pathname);
            setInvalid((prev) => true);
          }
        });
    }
  }, [location.search]);

  return (
    <div className="md:w-1/2 mx-auto">
      <Card>
        {success ? (
          <>
            <HiCheckCircle className="text-8xl mx-auto text-green-500" />
            <p className="text-lg font-semibold mb-3 text-center">
              Your password has been reset. Please login with your new password.
            </p>
            <Button
              type="button"
              size="sm"
              className="mx-auto"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Button>
          </>
        ) : null}
        {expired || invalid ? (
          <>
            <HiXCircle className="text-8xl mx-auto text-red-700" />
            <p className="text-lg font-semibold mb-3 text-center">
              {`${
                invalid ? "Invalid request." : "Your link has expired."
              } Please submit a new request.`}
            </p>
            <div className="flex justify-center">
              <Button
                type="button"
                size="sm"
                className="mx-auto"
                color="light"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
              <Button
                type="button"
                size="sm"
                className="mx-auto"
                onClick={() => navigate("/forget-password")}
              >
                Forget Password
              </Button>
            </div>
          </>
        ) : null}
        {!success && !expired && !invalid ? (
          <>
            <p className="text-lg font-semibold mb-3 text-center">
              Reset Password
            </p>
            <Formik
              initialValues={{
                password: "",
                confirm_password: "",
                show_password: false,
              }}
              onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                try {
                  await resetPassword({
                    user: user,
                    password: btoa(values.password),
                    confirm_password: btoa(values.confirm_password),
                  }).then(() => setSuccess((prev) => !prev));
                } catch (err) {
                  toast.error("Error encountered. Please try again later.");
                } finally {
                  setSubmitting(false);
                }
              }}
              validationSchema={ResetPasswordSchema}
            >
              {(props) => (
                <form onSubmit={props.handleSubmit}>
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
                      onClick={() => navigate("/login")}
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
          </>
        ) : null}
      </Card>
    </div>
  );
};

export default ResetPassword;
