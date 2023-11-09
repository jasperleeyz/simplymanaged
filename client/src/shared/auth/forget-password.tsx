import { Button, Card } from "flowbite-react";
import { Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import LabeledInputText from "../layout/form/labeled-text-input";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { forgetPassword } from "../api/user.api";
import { HiCheckCircle } from "react-icons/hi";

const ForgetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Field is required"),
});

const ForgetPassword = () => {
  const navigate = useNavigate();

  const [submitted, setSubmitted] = React.useState<boolean>(false);

  return (
    <div className="md:w-1/2 mx-auto">
      <Card>
        {submitted ? (
          <>
            <HiCheckCircle className="text-8xl mx-auto text-green-500" />
            <p className="text-lg font-semibold mb-3 text-center">
              Please check your email for instructions to reset your password.
            </p>
            <Button
              type="button"
              size="sm"
              className="mx-auto"
              onClick={() => navigate("/login")}
            >Back to Login</Button>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold mb-3 text-center">
              Forget Password
            </p>
            <Formik
              initialValues={{ email: "" }}
              onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                try {
                  await forgetPassword(values).then(() => setSubmitted(prev => !prev));
                } catch (err) {
                  toast.error("Error encountered. Please try again later.");
                } finally {
                  setSubmitting(false);
                }
              }}
              validationSchema={ForgetPasswordSchema}
            >
              {(props) => (
                <form onSubmit={props.handleSubmit}>
                  <LabeledInputText
                    id="login-email"
                    name="email"
                    labelValue="Email"
                    value={props.values.email}
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
                  <p className="text-gray-500 text-sm">
                    Please enter your email for verification. We will send you
                    an email for resetting your password.
                  </p>
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
        )}
      </Card>
    </div>
  );
};

export default ForgetPassword;
