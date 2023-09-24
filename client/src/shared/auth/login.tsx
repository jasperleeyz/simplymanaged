import { Button, Card, Label } from "flowbite-react";
import React from "react";
import LabeledInputText from "../layout/form/labeled-text-input";
import { Link, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { GlobalStateContext } from "../../configs/global-state-provider";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string().required("Required"),
});

const Login = () => {
  const isAuthenticated =
    React.useContext(GlobalStateContext)?.globalState?.isAuthenticated;
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, []);

  return (
    <div className="w-1/2 mx-auto">
      <Card>
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={(values, { setSubmitting }) => {}}
          validationSchema={LoginSchema}
        >
          {(props) => (
            <form onSubmit={props.handleSubmit}>
              <LabeledInputText
                id="login-email"
                name="email"
                labelValue="Email"
                value={props.values.email}
                onChange={props.handleChange}
                color={
                  props.errors.email && props.touched.email ? "failure" : "gray"
                }
                helperText={
                  props.errors.email && props.touched.email ? (
                    <>{props.errors.email}</>
                  ) : null
                }
              />
              <LabeledInputText
                id="login-password"
                name="password"
                type="password"
                labelValue="Password"
                value={props.values.password}
                onChange={props.handleChange}
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
              <div className="flex items-center mt-8 justify-between">
                <Link
                  className="hover:underline underline-offset-4 text-cyan-600 text-sm"
                  to="/forget-password"
                >
                  Forget password?
                </Link>
                <Button type="submit" size="sm">
                  Login
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default Login;
