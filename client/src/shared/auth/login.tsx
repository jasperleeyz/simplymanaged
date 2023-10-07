import { Button, Card, Label } from "flowbite-react";
import React from "react";
import LabeledInputText from "../layout/form/labeled-text-input";
import { Link, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { API_URL } from "../../configs/constants";
import { getHomeLink } from "../../configs/utils";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Field is required"),
  password: Yup.string().required("Field is required"),
});

type LoginDetails = {
  email: string;
  password: string;
};

const Login = () => {
  const isAuthenticated =
    React.useContext(GlobalStateContext)?.globalState?.isAuthenticated;

  const { globalState, setGlobalState } = React.useContext(GlobalStateContext);
  const navigate = useNavigate();

  const [loginError, setLoginError] = React.useState<string>("");

  // eslint-disable-next-line @typescript-eslint/require-await
  const login = async (loginDetails: LoginDetails) => {
    await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginDetails),
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json().then((data) => {
            // save token to session storage
            sessionStorage.setItem("bearerToken", data.bearerToken);

            // set global state to store user details
            setGlobalState((prevState) => ({
              isAuthenticated: true,
              user: {...data.user},
            }));

            return Promise.resolve();
          });
        } else {
          return res.text().then((data) => {
            return Promise.reject(data);
          });
        }
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(getHomeLink(globalState?.user?.role || ""), { replace: true });
    }
  }, [isAuthenticated]);

  return (
    <div className="md:w-1/2 mx-auto">
      <Card>
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);
            try {
              await login(values);
            } catch (err) {
              console.error(err);
              setLoginError(err as string);
            } finally {
              setSubmitting(false);
            }
          }}
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
              <LabeledInputText
                id="login-password"
                name="password"
                type="password"
                labelValue="Password"
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
              <div className="items-center mt-5">
                <p className="text-red-600">{loginError}</p>
              </div>
              <div className="flex items-center mt-8 justify-between">
                <Link
                  className="hover:underline underline-offset-4 text-cyan-600 text-sm"
                  to="/forget-password"
                >
                  Forget password?
                </Link>
                <Button
                  type="submit"
                  size="sm"
                  isProcessing={props.isSubmitting}
                  disabled={props.isSubmitting}
                >
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
